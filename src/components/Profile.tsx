import Header from "./Header";
import {
    Badge,
    Box,
    Button,
    Card,
    Container, FormControl, FormHelperText,
    Grid, IconButton, InputAdornment, InputLabel, ListItemText, MenuItem, Modal, Select, TextField, Tooltip,
    Typography
} from "@mui/material";
import React, {SyntheticEvent, useEffect, useState} from "react";
import defaultUserImage from "../static/default-profile.jpg";
import {useStore} from "../store";
import {User} from "../types/User";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {DriveFileRenameOutlineSharp, Visibility, VisibilityOff} from "@mui/icons-material";
import defaultProfilePicture from "../static/default-profile.jpg";
import {acceptedImageFileTypes, emailRegex, isEmptyOrSpaces, style} from "../helpers/HelperFunctions";



const Profile = () => {
    const userId = useStore(state => state.userId)
    const userLoggedIn = useStore(state => state.loggedIn)
    const userToken = useStore(state => state.userToken)
    const usersProfilePicture = useStore(state => state.userProfilePicture)
    const setUsersProfilePicture = useStore(state => state.setUserProfilePicture)
    const [currentUser, setCurrentUser] = useState<User>()
    const [currentEmail, setCurrentEmail] = useState("")
    const [firstNameError, setFirstNameError] = useState('')
    const [lastNameError, setLastNameError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [currentFirstName, setCurrentFirstName] = useState("")
    const [currentLastName, setCurrentLastName] = useState("")
    const [editUserError, setEditUserError] = useState("")
    const [currentProfilePicture, setCurrentProfilePicture] = useState("")
    const [updatedProfilePicture, setUpdatedProfilePicture] = useState(null)
    const [changePasswordError, setChangePasswordError] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [currentPasswordError, setCurrentPasswordError] = useState("")
    const [updatedPassword, setUpdatedPassword] = useState("")
    const [updatedPasswordError, setUpdatedPasswordError] = useState("")
    const [editUserModalOpen, setEditUserModalOpen] = useState(false)
    const [editProfilePictureModalOpen, setEditProfilePictureModalOpen] = useState(false)
    const [deleteProfilePictureModalOpen, setDeleteProfilePictureModalOpen] = useState(false)
    const [deleteProfilePictureError, setDeleteProfilePictureError] = useState("")
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
    const [changeProfilePicError, setChangeProfilePicError] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [hasProfilePic, setHasProfilePic] = useState(false)
    const handleClickShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
    const [showUpdatedPassword, setShowUpdatedPassword] = useState(false);
    const handleClickShowUpdatedPassword = () => setShowUpdatedPassword(!showUpdatedPassword);
    const navigate = useNavigate();

    const getUser = async () => {
        const requestHeaders = {
            headers: {
                "X-Authorization": userToken
            }
        }
        const foundUser: User = await axios.get(`http://localhost:4941/api/v1/users/${userId}`,  requestHeaders)
            .then((response) => {
                return response.data
            }).catch(() => {
                return undefined
            })

        await axios.get(`http://localhost:4941/api/v1/users/${userId}/image`)
            .then(() => {
                setHasProfilePic(true)
            }).catch(() => {
                setHasProfilePic(false)
            })


        if (foundUser !== undefined) {
            await resetEditUserFields(foundUser)
            await setCurrentUser(foundUser)
            return foundUser
        } else {
            navigate("/")
        }
    }

    useEffect(() => {

        if (!userLoggedIn) {
            navigate("/login")
        } else {
            getUser().catch()
        }
    }, [userLoggedIn, navigate] )

    const resetEditUserFields = (user: User) => {
        setCurrentEmail(user.email)
        setCurrentFirstName(user.firstName)
        setCurrentLastName(user.lastName)
        setCurrentProfilePicture(`http://localhost:4941/api/v1/users/${userId}/image`)
        setUsersProfilePicture(`http://localhost:4941/api/v1/users/${userId}/image`)
        setUpdatedProfilePicture(null)
        setCurrentPassword("")
        setUpdatedPassword("")
    }

    const handleEditUserModalClose = () => {
        resetEditUserErrors()
        setEditUserModalOpen(false)
    }

    const handleEditProfilePictureModalClose = () => {
        resetEditUserFields(currentUser as User)
        setEditProfilePictureModalOpen(false)
    }

    const handleDeleteProfilePictureModalClose = () => {
        resetEditUserFields(currentUser as User)
        setDeleteProfilePictureModalOpen(false)
    }

    const handleChangePasswordModalClose = () => {
        resetPasswordErrors()
        resetPasswords()
        setChangePasswordModalOpen(false)
    }

    const handleEditUserModalOpen = () => {
        setEditUserModalOpen(true)
    }

    const handleEditProfilePictureModalOpen = () => {
        setEditProfilePictureModalOpen(true)
    }

    const handleDeleteProfilePictureModalOpen = () => {
        setDeleteProfilePictureModalOpen(true)
    }

    const handleChangePasswordModalOpen = () => {
        setChangePasswordModalOpen(true)
    }

    const checkEditUserErrors = () => {
        const firstErrors = checkFirstNameErrors(currentFirstName)
        const lastErrors = checkLastNameErrors(currentLastName)
        const emErrors = checkEmailErrors(currentEmail)

        return (firstErrors && lastErrors && emErrors)
    }
    const resetEditUserErrors = () => {
        setFirstNameError("")
        setLastNameError("")
        setEmailError("")
        setEditUserError("")
    }

    const checkFirstNameErrors = (newFirstName: string) => {
        if (newFirstName.length < 1 || newFirstName.length > 64) {
            setFirstNameError("Error: First name must be between 1 and 64 characters")
        } else if (isEmptyOrSpaces(newFirstName)) {
            setFirstNameError("Error: First name must not be blank")
        } else {
            setFirstNameError('')
            return true
        }
        return false
    }

    const checkLastNameErrors = (newLastName: string) => {
        if (newLastName.length < 1 || newLastName.length > 64) {
            setLastNameError("Error: Last name must be between 1 and 64 characters")
        } else if (isEmptyOrSpaces(newLastName)) {
            setLastNameError("Error: Last name must not be blank")
        } else {
            setLastNameError('')
            return true
        }
        return false
    }

    const checkEmailErrors = (newEmail: string) => {
        if (!newEmail.match(emailRegex)) {
            setEmailError("Error: Please enter a valid email address")
        } else if (newEmail.length < 1 || newEmail.length > 128) {
            setEmailError("Error: Email must be between 1 and 128 characters long")
        } else {
            setEmailError('')
            return true
        }
        return false
    }
    const checkPasswords = () => {
        const newPasswordErr = checkUpdatedPasswordErrors(updatedPassword)
        const currentPasswordErr = checkCurrentPasswordErrors(currentPassword)
        return newPasswordErr && currentPasswordErr
    }

    const resetPasswords = () => {
        setCurrentPassword("")
        setUpdatedPassword("")
    }

    const resetPasswordErrors = () => {
        setChangePasswordError("")
        setCurrentPasswordError("")
        setUpdatedPasswordError("")
    }

    const checkCurrentPasswordErrors = (newPassword: string) => {
        if (newPassword.length < 6 || newPassword.length > 256) {
            setCurrentPasswordError("Error: Password must be between 6 and 256 characters long")
        } else {
            setCurrentPasswordError('')
            return true
        }
        return false
    }

    const checkUpdatedPasswordErrors = (newPassword: string) => {
        if (newPassword.length < 6 || newPassword.length > 256) {
            setUpdatedPasswordError("Error: Password must be between 6 and 256 characters long")
        } else {
            setUpdatedPasswordError('')
            return true
        }
        return false
    }

    const handleUpdatedPasswordChanged = (newPassword: string) => {
        checkUpdatedPasswordErrors(newPassword)
        setUpdatedPassword(newPassword)
    }

    const handleCurrentPasswordChanged = (newPassword: string) => {
        checkCurrentPasswordErrors(newPassword)
        setCurrentPassword(newPassword)
    }

    const handleFirstNameChanged = (newFirstName: string) => {
        checkFirstNameErrors(newFirstName)
        setCurrentFirstName(newFirstName)
    }

    const handleLastNameChanged = (newLastName: string) => {
        checkLastNameErrors(newLastName)
        setCurrentLastName(newLastName)
    }

    const handleEmailChanged = (newEmail: string) => {
        checkEmailErrors(newEmail)
        setCurrentEmail(newEmail)
    }

    const saveProfilePicture = async (profilePicture: any, userToken: string, userId: number) => {
        let profilePictureType = profilePicture.type

        if (profilePictureType === 'image/jpg') {
            profilePictureType = 'image/jpeg'
        }

        const requestHeaders = {
            headers: {
                "content-type": profilePictureType,
                "X-Authorization": userToken
            }
        }
        const saveProfilePictureResponse =  await axios.put(`http://localhost:4941/api/v1/users/${userId}/image`, profilePicture, requestHeaders)
            .then((response) => {
                return response
            })
            .catch((err) => {
                setChangeProfilePicError("Error saving profile picture: Please try again in the profile page")
                return err.response
            })
        return saveProfilePictureResponse.status
    }

    const handleChangePasswordErrors = (resStatus: number, resText: string) => {
        if (resStatus === 400) {
            setCurrentPasswordError("Error: Current password is incorrect")
        } else {
            setChangePasswordError("Server Error: Please try again later")
        }
    }

    const changePassword = async () => {
        const requestHeaders = {
            headers: {
                "X-Authorization": userToken
            }
        }
        return await axios.patch(`http://localhost:4941/api/v1/users/${userId}`, {
            "password": updatedPassword,
            "currentPassword": currentPassword
        }, requestHeaders).then(response => {
            return response.status
        }).catch(err => {
            handleChangePasswordErrors(err.response.status, err.response.statusText)
        })
    }

    const submitSaveProfilePicture = async () => {
        const saveProfilePicResponse = await saveProfilePicture(updatedProfilePicture, userToken, userId)
        if (saveProfilePicResponse !== 200) {
            return
        }
        setHasProfilePic(true)
        setUsersProfilePicture(currentProfilePicture)
        setEditProfilePictureModalOpen(false)
    }

    const submitSavePassword = async () => {
        setChangePasswordError('')
        if (!checkPasswords) {
            return
        }
        const changePasswordResponse = await changePassword()
        if (changePasswordResponse !== 200) {
            return
        }
        handleChangePasswordModalClose()
    }

    const deleteProfilePicture = async () => {
        const requestHeaders = {
            headers: {
                "X-Authorization": userToken
            }
        }
        const deleteProfilePictureResponse = await axios.delete(`http://localhost:4941/api/v1/users/${userId}/image`, requestHeaders)
            .then((response) => {
                return response
            }).catch((err) => {
                return err.response
            })

        if (deleteProfilePictureResponse.status === 200) {
            setDeleteProfilePictureError("")
        } else if (deleteProfilePictureResponse.status === 403) {
            setDeleteProfilePictureError("Error: Client authentication mismatch, please close the popup and try again")
        } else if (deleteProfilePictureResponse.status === 401) {
            setDeleteProfilePictureError("Error: Client authentication mismatch, please close the popup and try again")
        } else if (deleteProfilePictureResponse.status === 404) {
            setDeleteProfilePictureError("Error: You must upload a profile picture before trying to delete it")
        } else {
            setDeleteProfilePictureError("Server Error: Please try again")
        }

        return deleteProfilePictureResponse.status
    }

    const handleEditUserErrors = (resStatus: number, resText: string) => {
        // Check the response for first and last name errors
        if (resStatus === 400 && resText === "Invalid length of first/last name") {
            if (currentFirstName.length < 1 || currentFirstName.length > 64) {
                setFirstNameError("Error: First name must be between 1 and 64 characters")
            } else {
                setFirstNameError('')
            }
            if (currentLastName.length < 1 || currentLastName.length > 64) {
                setLastNameError("Error: Last name must be between 1 and 64 characters")
            } else {
                setLastNameError('')
            }
        } else {
            setFirstNameError('')
            setLastNameError('')
        }
        // Check the response for email and password errors
        if (resStatus === 403) {
            setEmailError("Error: Email address already in use")
        } else if (resStatus === 400 && resText === "Invalid email") {
            if (!currentEmail.includes('@')) {
                setEmailError("Error: Email must contain an '@' symbol")
            } else if (currentEmail.length < 1 || currentEmail.length>128) {
                setEmailError("Error: Email must be between 1 and 128 characters long")
            } else {
                setEmailError('')
            }
        } else {
            setEmailError('')
        }
        if (resStatus === 500) {
            setEditUserError("Server Error: Please try again")
        }
    }

    const editUser = async () => {
        const requestHeaders = {
            headers: {
                "X-Authorization": userToken
            }
        }

        return await axios.patch(`http://localhost:4941/api/v1/users/${userId}`, {
            "firstName": currentFirstName,
            "lastName": currentLastName,
            "email": currentEmail
        }, requestHeaders).then(response => {
            return response.status
        }).catch(err => {
            handleEditUserErrors(err.response.status, err.response.statusText)
            return err.response.status
        })
    }

    const handleDeleteProfilePicture = async () => {
        const deleteProfilePictureResponse = await deleteProfilePicture()
        if (deleteProfilePictureResponse !== 200) {
            return
        }
        setHasProfilePic(false)
        setUsersProfilePicture(defaultProfilePicture)
        handleDeleteProfilePictureModalClose()
    }

    const submitEditUser = async () => {
        if (!checkEditUserErrors()) {
            return
        }
        const editUserResponse = await editUser()

        if (editUserResponse !== 200) {
            return
        }
        await getUser()
        handleEditUserModalClose()
    }

    function uploadProfilePicture(e: any) {
        const profilePicture = e.target.files[0]
        setUpdatedProfilePicture(profilePicture)
        if (profilePicture !== undefined && acceptedImageFileTypes.includes(profilePicture.type)) {
            const auctionImagePath = URL.createObjectURL(profilePicture)
            setCurrentProfilePicture(auctionImagePath)
            setChangeProfilePicError("")
        }
    }

    return (
        <>
            <Header/>

            <Container sx={{ py: 8}} maxWidth="lg">
                {currentUser !== undefined &&
                    <Card>
                        <Grid container>
                            <Grid item xs={3} style={{display: 'block', gap: "1rem", height: "auto"}}
                                  sx={{pl: 2, pt: 2}} justifyContent="flex-start">
                                <img
                                    width={"100%"}
                                    height={"auto"}
                                    src={usersProfilePicture}
                                    alt="Auction"
                                    onError={(event: SyntheticEvent<HTMLImageElement>) => {event.currentTarget.src = defaultUserImage; setHasProfilePic(false)}}/>
                            </Grid>
                            <Grid item xs={8} style={{display: 'flex'}}>
                                <Grid container>
                                    <Grid item xs={9} style={{display: 'flex', alignItems: 'center'}}
                                          justifyContent="flex-start">
                                        <Typography gutterBottom variant="h5" component="h2" sx={{pl: 2, pt: 1}}>
                                            {`First Name: ${currentUser.firstName}`}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={9} style={{display: 'flex', alignItems: 'center'}}
                                          justifyContent="flex-start">
                                        <Typography gutterBottom variant="h5" component="h2" sx={{pl: 2, pt: 1}}>
                                            {`Last Name: ${currentUser.lastName}`}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={9} style={{display: 'flex', alignItems: 'center'}}
                                          justifyContent="flex-start">
                                        <Typography gutterBottom variant="h5" component="h2" sx={{pl: 2, pt: 1}}>
                                            {`Email: ${currentUser.email}`}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={3} style={{ alignItems: 'center'}} justifyContent="center">
                                <Button type={"button"} variant="contained" sx={{mt: 1, ml: 2}} onClick={handleEditProfilePictureModalOpen}>
                                    Change Profile Picture
                                </Button>
                                {hasProfilePic &&
                                    <Button type={"button"} variant="contained" sx={{mt: 1, mb: 2, ml: 2}}
                                            onClick={handleDeleteProfilePictureModalOpen}>
                                        Delete Profile Picture
                                    </Button>
                                }
                            </Grid>

                            <Grid item xs={4} style={{display: 'flex', alignItems: 'start'}} justifyContent="flex-start">
                                <Button type={"button"} variant="contained" sx={{mt: 1, mb: 2, ml: 2}} onClick={handleEditUserModalOpen}>
                                    Edit Details
                                </Button>
                            </Grid>
                            <Grid item xs={4} style={{display: 'flex', alignItems: 'start'}} justifyContent="flex-start">
                                <Button type={"button"} variant="contained" sx={{mt: 1, mb: 2, ml: 2}} onClick={handleChangePasswordModalOpen}>
                                    Change Password
                                </Button>
                            </Grid>
                        </Grid>
                        <Modal
                            open={deleteProfilePictureModalOpen}
                            onClose={handleDeleteProfilePictureModalClose}
                        >
                            <Box sx={style}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" color="error.main">
                                            {deleteProfilePictureError}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                            Are you sure you want to delete your profile picture
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{display: "flex", align:"center"}}>
                                        <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={handleDeleteProfilePictureModalClose}>
                                            No
                                        </Button>
                                        <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={handleDeleteProfilePicture}>
                                            Yes, delete my profile picture
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Modal>
                        <Modal
                            open={editProfilePictureModalOpen}
                            onClose={handleEditProfilePictureModalClose}
                        >
                            <Box sx={style}>
                                <Grid container>
                                    <Grid item xs={12} style={{display: 'flex', alignItems: 'top'}} justifyContent={"center"}>
                                        <Typography id="modal-modal-title" variant="h6" component="h2" >
                                            Change Profile Picture
                                        </Typography> <br/>
                                    </Grid>
                                    <Grid sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} item xs={12}>
                                            <img
                                                height={"400"}
                                                src={currentProfilePicture}
                                                alt="Profile Picture"
                                                onError={(event: SyntheticEvent<HTMLImageElement>) => event.currentTarget.src = defaultProfilePicture}/>
                                    </Grid>

                                    <Grid item xs={12} sx={{display: "flex", alignItems: 'center'}} justifyContent={"center"}>
                                        <Typography color="error.main">
                                            {changeProfilePicError}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}} justifyContent={"center"}>
                                        <Button variant="contained" component="label" sx={{mt: 2, mr: 2}}>
                                            Upload
                                            <input hidden type="file" accept=".jpg,.jpeg,.png,.gif" id="file-input" onChange={(e) => uploadProfilePicture(e)}/>
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6} style={{display: 'flex', alignItems: 'center'}} justifyContent={"flex-end"}>
                                        <Button type={"button"} variant="contained" sx={{mt: 2, mr: 2}} onClick={handleEditProfilePictureModalClose}>
                                            Discard
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6} style={{display: 'flex', alignItems: 'center'}} justifyContent={"flex-start"}>
                                        <Button type={"button"} variant="contained" sx={{mt: 2, ml: 2}} onClick={submitSaveProfilePicture}>
                                            Save
                                        </Button>
                                    </Grid>

                                </Grid>
                            </Box>
                        </Modal>
                        <Modal
                            open={changePasswordModalOpen}
                            onClose={handleChangePasswordModalClose}
                        >
                            <Box sx={style}>
                                <Box sx={style}>
                                    <Grid container spacing={2}>

                                        <Grid item xs={12} sx={{display: "flex", alignItems: 'center'}} justifyContent={"center"}>
                                            <Typography color="error.main">
                                                {changePasswordError}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                name="current-password"
                                                label="Current Password"
                                                type={showCurrentPassword ? "text": "password"}
                                                id="current-password"
                                                autoComplete="current-password"
                                                onChange={e => handleCurrentPasswordChanged(e.target.value)}
                                                error={currentPasswordError !== ''}
                                                helperText={currentPasswordError}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowCurrentPassword}
                                                            >
                                                                {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                name="updatedPassword"
                                                label="New Password"
                                                type={showUpdatedPassword ? "text": "password"}
                                                id="updated-password"
                                                autoComplete="updated-password"
                                                onChange={e => handleUpdatedPasswordChanged(e.target.value)}
                                                error={updatedPasswordError !== ''}
                                                helperText={updatedPasswordError}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowUpdatedPassword}
                                                            >
                                                                {showUpdatedPassword ? <Visibility /> : <VisibilityOff />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{display: "flex", align:"center"}}>
                                            <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={handleChangePasswordModalClose}>
                                                Discard
                                            </Button>
                                            <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={submitSavePassword}>
                                                Change Password
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Modal>
                        <Modal
                            open={editUserModalOpen}
                            onClose={handleEditUserModalClose}
                        >
                            <Box sx={style}>
                                <Box sx={style}>
                                    <Grid container spacing={2}>

                                        <Grid item xs={12} sx={{display: "flex", alignItems: 'center'}} justifyContent={"center"}>
                                            <Typography color="error.main">
                                                {editUserError}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                autoComplete="given-name"
                                                name="firstName"
                                                required
                                                fullWidth
                                                id="firstName"
                                                label="First Name"
                                                autoFocus
                                                value={currentFirstName}
                                                onChange={e => handleFirstNameChanged(e.target.value)}
                                                error={firstNameError !== ''}
                                                helperText={firstNameError}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                id="lastName"
                                                label="Last Name"
                                                name="lastName"
                                                autoComplete="family-name"
                                                value={currentLastName}
                                                onChange={e => handleLastNameChanged(e.target.value)}
                                                error={lastNameError !== ''}
                                                helperText={lastNameError}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                id="email"
                                                label="Email Address"
                                                name="email"
                                                autoComplete="email"
                                                value={currentEmail}
                                                onChange={e => handleEmailChanged(e.target.value)}
                                                error={emailError !== ''}
                                                helperText={emailError}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{display: "flex", align:"center"}}>
                                            <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={() => {
                                                resetEditUserFields(currentUser as User)
                                                handleEditUserModalClose()
                                            }}>
                                                Discard
                                            </Button>
                                            <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={submitEditUser}>
                                                Save Changes
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Modal>
                    </Card>
                }
            </Container>
        </>
    )
}

export default Profile