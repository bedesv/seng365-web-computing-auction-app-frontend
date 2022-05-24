import React, {useEffect, useState} from 'react';
import {
    Badge,
    Button,
    createTheme,
    CssBaseline,
    Grid, IconButton, InputAdornment,
    Link,
    TextField,
    ThemeProvider,
    Tooltip,
    Typography
} from "@mui/material";
import axios from "axios";
import {DriveFileRenameOutlineSharp, Visibility, VisibilityOff} from "@mui/icons-material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import {useNavigate} from "react-router-dom";
import Header from "./Header";
import defaultProfilePicture from "../static/default-profile.jpg"
import {useStore} from "../store";
import {acceptedImageFileTypes, emailRegex, isEmptyOrSpaces} from "../helpers/HelperFunctions";

const Register = () => {
    // create state and error message variables for each input
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstNameError, setFirstNameError] = useState('')
    const [lastNameError, setLastNameError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [globalError, setGlobalError] = useState('')
    const [profilePicturePreview, setProfilePicturePreview] = useState(defaultProfilePicture)
    const [profilePicture, setProfilePicture] = useState(null)
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const theme = createTheme();
    const navigate = useNavigate();
    const userLoggedIn = useStore(state => state.loggedIn)
    const saveUserLogin = useStore(state => state.login)

    useEffect(() => {
        if (userLoggedIn) {
            navigate("/")
        }
    }, [userLoggedIn, navigate] )



    const checkErrors = () => {
        const firstErrors = checkFirstNameErrors(firstName)
        const lastErrors = checkLastNameErrors(lastName)
        const emErrors = checkEmailErrors(email)
        const passErrors = checkPasswordErrors(password)

        return (firstErrors && lastErrors && emErrors && passErrors)
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
        } else if (newEmail.length < 1 || newEmail.length>128) {
            setEmailError("Error: Email must be between 1 and 128 characters long")
        } else {
            setEmailError('')
            return true
        }
        return false
    }

    const checkPasswordErrors = (newPassword: string) => {
        if (newPassword.length < 6 || newPassword.length > 256) {
            setPasswordError("Error: Password must be between 6 and 256 characters long")
        } else {
            setPasswordError('')
            return true
        }
        return false
    }

    const handleFirstNameChanged = (newFirstName: string) => {
        checkFirstNameErrors(newFirstName)
        setFirstName(newFirstName)
    }

    const handleLastNameChanged = (newLastName: string) => {
        checkLastNameErrors(newLastName)
        setLastName(newLastName)
    }

    const handleEmailChanged = (newEmail: string) => {
        checkEmailErrors(newEmail)
        setEmail(newEmail)
    }

    const handlePasswordChanged = (newPassword: string) => {
        checkPasswordErrors(newPassword)
        setPassword(newPassword)
    }

    const handleRegisterErrors = (resStatus: number, resText: string ) => {
        // Check the response for first and last name errors
        if (resStatus === 400 && resText === "Invalid length of first/last name") {
            if (firstName.length < 1 || firstName.length > 64) {
                setFirstNameError("Error: First name must be between 1 and 64 characters")
            } else {
                setFirstNameError('')
            }
            if (lastName.length < 1 || lastName.length > 64) {
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
        } else if (resStatus === 400 && resText === "Invalid email/password") {
            if (password.length < 6 || password.length > 256) {
                setPasswordError("Error: Password must be between 6 and 256 characters long")
            } else {
                setPasswordError('')
            }

            if (!email.includes('@')) {
                setEmailError("Error: Email must contain an '@' symbol")
            } else if (email.length < 1 || email.length>128) {
                setEmailError("Error: Email must be between 1 and 128 characters long")
            } else {
                setEmailError('')
            }
        } else {
            setEmailError('')
            setPasswordError('')
        }
        if (resStatus === 500) {
            setGlobalError("Server Error: Please try again")
        }
    }

    const register = async () => {
        setGlobalError('')
        if (!checkErrors()) {
            return 500
        }
        const registerResponse = await axios.post('http://localhost:4941/api/v1/users/register', {
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": password
        })
            .then((response) => {
                return response
            }).catch(err => {
                handleRegisterErrors(err.response.status, err.response.statusText)
                return err.response
            })
        return registerResponse.status
    }

    const login = async () => {
        const loginResponse =  await axios.post('http://localhost:4941/api/v1/users/login', {
            "email": email,
            "password": password
        }).then(async (response) => {
            // Store userId and userToken for later use
            await saveUserLogin(response.data.userId, response.data.token, profilePicturePreview)

            // Calling saveProfilePicture here because the saveUserLogin doesn't update fast enough and await doesn't
            // work for some reason
            if (profilePicture !== null) {
                await saveProfilePicture(profilePicture, response.data.token, response.data.userId)
            }
            return response
        }).catch(err => {
            setGlobalError("Server Error: Please try again later")
            return err.response
        })
        return loginResponse.status
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
                setGlobalError("Error saving profile picture: Please try again in the profile page")
                return err.response
            })
        return saveProfilePictureResponse.status


    }

    const handleSubmit = async () => {
        const registerResponse = await register()
        if (registerResponse !== 201) {
            return
        }
        const loginResponse = await login()
        if (loginResponse !== 200) {
            return
        }
        navigate("/")

    };

    function uploadProfilePicture(e: any) {
        const profilePicture = e.target.files[0]
        setProfilePicture(profilePicture)
        if (profilePicture !== undefined && acceptedImageFileTypes.includes(profilePicture.type)) {
            const profilePicturePath = URL.createObjectURL(profilePicture)
            setProfilePicturePreview(profilePicturePath)
        }
    }

    return (

        <ThemeProvider theme={theme}>
            <Header/>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >

                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Typography variant="h6" color="error.main">
                        {globalError}
                    </Typography>

                    <Box component="form" onSubmit={async (e: { preventDefault: () => void; }) => {
                        await handleSubmit();
                        e.preventDefault()
                    }} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} item xs={12}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                    badgeContent={
                                    <>
                                        <Tooltip title="Upload Profile Picture">
                                            <label htmlFor="file-input">
                                                <DriveFileRenameOutlineSharp sx={{cursor: "pointer"}} color='primary' />
                                            </label>
                                        </Tooltip>
                                            <input hidden type="file" accept=".jpg,.jpeg,.png,.gif" id="file-input" onChange={(e) => uploadProfilePicture(e)}/>
                                    </>
                                    }>
                                    <Avatar sx={{height: 100, width: 100}} alt="User" src={profilePicturePreview}  />
                                </Badge>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    onChange={e => handleFirstNameChanged(e.target.value)}
                                    error={firstNameError !== ''}
                                    helperText={firstNameError}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
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
                                    onChange={e => handleEmailChanged(e.target.value)}
                                    error={emailError !== ''}
                                    helperText={emailError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? "text": "password"}
                                    id="password"
                                    autoComplete="new-password"
                                    onChange={e => handlePasswordChanged(e.target.value)}
                                    error={passwordError !== ''}
                                    helperText={passwordError}
                                    InputProps={{ // <-- This is where the toggle button is added.
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                >
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="button"
                            fullWidth
                            id="registerButton"
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={() => handleSubmit()}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>

    );
};

export default Register;