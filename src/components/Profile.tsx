import Header from "./Header";
import {
    Button,
    Card,
    Container,
    Grid,
    Typography
} from "@mui/material";
import React, {SyntheticEvent, useEffect, useState} from "react";
import defaultUserImage from "../static/default-profile.jpg";
import {useStore} from "../store";
import {User} from "../types/User";
import {useNavigate} from "react-router-dom";
import axios from "axios";



const Profile = () => {
    const userId = useStore(state => state.userId)
    const userLoggedIn = useStore(state => state.loggedIn)
    const userToken = useStore(state => state.userToken)
    const [currentUser, setCurrentUser] = useState<User>()
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const requestHeaders = {
                headers: {
                    "X-Authorization": userToken
                }
            }
            const foundUser: User = await axios.get(`http://localhost:4941/api/v1/users/${userId}`,  requestHeaders)
                .then((response) => {
                    console.log(response.data)
                    return response.data
                }).catch(() => {
                    return undefined
                })

            if (foundUser !== undefined) {
                resetEditUserFields(foundUser)
                await setCurrentUser(foundUser)
                return foundUser
            } else {
                navigate("/")
            }
        }

        if (!userLoggedIn) {
            navigate("/login")
        } else {
            getUser().catch()
        }
    }, [userLoggedIn, navigate] )

    const resetEditUserFields = (user: User) => {

    }

    const handleEditUserModalOpen = () => {

    }

    const handleEditProfilePictureModalOpen = () => {

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
                                    src={`http://localhost:4941/api/v1/users/${userId}/image`}
                                    alt="Auction"
                                    onError={(event: SyntheticEvent<HTMLImageElement>) => event.currentTarget.src = defaultUserImage}/>
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
                            <Grid item xs={3} style={{display: 'flex', alignItems: 'center'}} justifyContent="center">
                                    <Button type={"button"} variant="contained" sx={{mt: 1, mb: 2, ml: 2}} onClick={handleEditProfilePictureModalOpen}>
                                        Change Profile Picture
                                    </Button>
                            </Grid>
                            <Grid item xs={8} style={{display: 'flex', alignItems: 'center'}} justifyContent="flex-start">
                                <Button type={"button"} variant="contained" sx={{mt: 1, mb: 2, ml: 2}} onClick={handleEditUserModalOpen}>
                                    Edit Details
                                </Button>
                            </Grid>
                        </Grid>
                    </Card>
                }
            </Container>
        </>
    )
}

export default Profile