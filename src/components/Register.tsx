import React, {createRef, useState} from 'react';
import {Button, createTheme, CssBaseline, Grid, Link, TextField, ThemeProvider, Typography} from "@mui/material";
import axios from "axios";
import {Copyright} from "@mui/icons-material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {useNavigate} from "react-router-dom";
import Cookies from 'js-cookie'
import Header from "./Header";

const Register = () => {
    // create state and error message variablesvariables for each input
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstNameError, setFirstNameError] = useState('')
    const [lastNameError, setLastNameError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [globalError, setGlobalError] = useState('')
    const theme = createTheme();
    const navigate = useNavigate();

    const resetErrors = () => {
        setEmailError('')
        setFirstNameError('')
        setLastNameError('')
        setPasswordError('')
    }

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
        } else {
            setFirstNameError('')
            return true
        }
        return false
    }

    const checkLastNameErrors = (newLastName: string) => {
        if (newLastName.length < 1 || newLastName.length > 64) {
            setLastNameError("Error: Last name must be between 1 and 64 characters")
        } else {
            setLastNameError('')
            return true
        }
        return false
    }

    const checkEmailErrors = (newEmail: string) => {
        if (!newEmail.includes('@')) {
            setEmailError("Error: Email must contain an '@' symbol")
        } else if (newEmail.length < 1 || newEmail.length>128) {
            setEmailError("Error: Email must be between 1 and 128 characters long")
        } else {
            setEmailError('')
            return true
        }
        return false
    }

    const checkPasswordErrors = (newPassword: string) => {
        if (newPassword.length < 1 || newPassword.length > 256) {
            setPasswordError("Error: Password must be between 1 and 256 characters long")
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
        if (resStatus === 500) {
            setEmailError("Error: Email address already in use")
        } else if (resStatus === 400 && resText === "Invalid email/password") {
            if (password.length < 1 || password.length > 256) {
                setPasswordError("Error: Password must be between 1 and 256 characters long")
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
    }

    const login = () => {
        axios.post('http://localhost:4941/api/v1/users/login', {
            "email": email,
            "password": password
        }).then((response) => {
            Cookies.set("userToken", response.data.token)
            Cookies.set("userId", response.data.userId)
        }).catch(err => {
            setGlobalError("Unknown Error: Please try again")
        })
    }



    const handleSubmit = () => {
        if (!checkErrors()) {
            return
        }
        axios.post('http://localhost:4941/api/v1/users/register', {
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": password
        })
            .then((response) => {
                setGlobalError("Unknown Error: Please try again")
                resetErrors()
            }).catch(err => {
                handleRegisterErrors(err.response.status, err.response.statusText)
            })
        };

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
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Typography variant="h6" color="error.main">
                        {globalError}
                    </Typography>

                    <Box component="form" onSubmit={(e: { preventDefault: () => void; }) => {handleSubmit() ; e.preventDefault()}} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
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
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    onChange={e => handlePasswordChanged(e.target.value)}
                                    error={passwordError !== ''}
                                    helperText={passwordError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    multiple
                                    type="file"
                                />
                                <label htmlFor="raised-button-file">
                                    <Button type="button" >
                                        Upload
                                    </Button>
                                </label>
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
                <Copyright sx={{ mt: 5 }} />
            </Container>
        </ThemeProvider>

    );
};

export default Register;