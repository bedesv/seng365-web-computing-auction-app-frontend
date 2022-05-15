import React, { useState } from 'react';
import {
    Button,
    Checkbox,
    createTheme,
    CssBaseline,
    FormControlLabel,
    Grid, Link,
    makeStyles,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import axios from "axios";
import {Copyright} from "@mui/icons-material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {useNavigate} from "react-router-dom";

// @ts-ignore
const Register = () => {
    // create state variables for each input
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const theme = createTheme();
    const navigate = useNavigate();

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        axios.post('http://localhost:4941/api/v1/users/register', {
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": password
        }).then((response) => {
                navigate('/home')
            })
        console.log(firstName, lastName, email, password);
    };

    return (

        <ThemeProvider theme={theme}>
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
                    <Box component="form" noValidate onSubmit={(e: { preventDefault: () => void; }) => {
                        // @ts-ignore
                        document.getElementById("registerButton").click() ; e.preventDefault()}} sx={{ mt: 3 }}>
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
                                    onChange={e => setFirstName(e.target.value)}
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
                                    onChange={e => setLastName(e.target.value)}
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
                                    onChange={e => setEmail(e.target.value)}
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
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="button"
                            fullWidth
                            id="registerButton"
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={() => handleSubmit}
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
        // <form onSubmit={handleSubmit}>
        //     <TextField
        //         label="First Name"
        //         variant="filled"
        //         required
        //         value={firstName}
        //         onChange={e => setFirstName(e.target.value)}
        //     />
        //     <TextField
        //         label="Last Name"
        //         variant="filled"
        //         required
        //         value={lastName}
        //         onChange={e => setLastName(e.target.value)}
        //     />
        //     <TextField
        //         label="Email"
        //         variant="filled"
        //         type="email"
        //         required
        //         value={email}
        //         onChange={e => setEmail(e.target.value)}
        //     />
        //     <TextField
        //         label="Password"
        //         variant="filled"
        //         type="password"
        //         required
        //         value={password}
        //         onChange={e => setPassword(e.target.value)}
        //     />
        //     <div>
        //         <Button variant="contained" onClick={handleClose}>
        //             Cancel
        //         </Button>
        //         <Button type="submit" variant="contained" color="primary">
        //             Signup
        //         </Button>
        //     </div>
        // </form>
    );
};

export default Register;