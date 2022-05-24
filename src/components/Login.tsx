import React, {useEffect, useState} from 'react';
import {
    Button,
    createTheme,
    CssBaseline,
    Grid, IconButton, InputAdornment,
    Link,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import axios, {AxiosResponse} from "axios";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import {useNavigate} from "react-router-dom";
import Header from "./Header";
import {useStore} from "../store";
import {emailRegex} from "../helpers/HelperFunctions";

const Login = () => {
    // create state and error message variables for each input
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [globalError, setGlobalError] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const theme = createTheme();
    const navigate = useNavigate();
    const userLoggedIn = useStore(state => state.loggedIn)
    const saveUserLogin = useStore(state => state.login)

    const checkErrors = () => {
        const emErrors = checkEmailErrors(email)
        const passErrors = checkPasswordErrors(password)

        return (emErrors && passErrors)
    }

    useEffect(() => {
        if (userLoggedIn) {
            navigate("/")
        }
    }, [userLoggedIn, navigate] )

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

    const handleEmailChanged = (newEmail: string) => {
        checkEmailErrors(newEmail)
        setEmail(newEmail)
    }

    const handlePasswordChanged = (newPassword: string) => {
        checkPasswordErrors(newPassword)
        setPassword(newPassword)
    }

    const login = async () => {
        if (!checkErrors()) {
            return 0 // Return if there are field errors
        }
        const loginResponse =  await axios.post('http://localhost:4941/api/v1/users/login', {
            "email": email,
            "password": password
        }).then(async (response) => {
            // Store userId and userToken for later use
            setGlobalError("")

            const imageData: AxiosResponse<any> | null = await axios.get(`http://localhost:4941/api/v1/users/${response.data.userId}/image`)
                .then( (response) => {
                        return response
                    }).catch (() => {
                        return null
                })
            if (imageData !== null) {
                saveUserLogin(response.data.userId, response.data.token, `http://localhost:4941/api/v1/users/${response.data.userId}/image`)
            } else {
                saveUserLogin(response.data.userId, response.data.token)
            }

            return response
        }).catch(err => {
            if (err.response.status === 400) {
                setGlobalError(err.response.statusText)
            } else {
                setGlobalError("Server Error: Please try again")
            }
            return err.response
        })
        return loginResponse.status
    }


    const handleSubmit = async () => {

        if (await login() !== 200) {
            return
        }
        navigate("/")

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

                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Typography variant="h6" color="error.main">
                        {globalError}
                    </Typography>

                    <Box component="form" onSubmit={async (e: { preventDefault: () => void; }) => {
                        await handleSubmit();
                        e.preventDefault()
                    }} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
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
                            id="signInButton"
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={() => handleSubmit()}
                        >
                            Sign In
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/register" variant="body2">
                                    Don't have an account? Register
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>

    );
};

export default Login;