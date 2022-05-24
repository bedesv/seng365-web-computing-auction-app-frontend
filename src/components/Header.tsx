import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import {useStore} from "../store";
import {useNavigate} from "react-router-dom";

const Header = () => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const userLoggedIn = useStore(state => state.loggedIn)
    const userProfilePicture = useStore(state => state.userProfilePicture)
    const logoutUser = useStore(state => state.logout)
    const navigate = useNavigate();

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        SENG365
                    </Typography>
                        <>
                            {userLoggedIn &&
                                <Box sx={{flexGrow: 1, display: "flex", gap: "1rem"}} justifyContent="flex-end">
                                    <Tooltip title="User Options">
                                        <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                            <Avatar src={userProfilePicture}/>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        sx={{mt: '45px'}}
                                        id="menu-appbar"
                                        anchorEl={anchorElUser}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                    >
                                        <MenuItem onClick={() => {
                                            navigate(`/profile`)
                                        }}>
                                            <Typography textAlign="center">Profile</Typography>
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            navigate("/myAuctions")
                                        }}>
                                            <Typography textAlign="center">My Auctions</Typography>
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            logoutUser();
                                            navigate("/login")
                                        }}>
                                            <Typography textAlign="center">Logout</Typography>
                                        </MenuItem>
                                    </Menu>
                                </Box>
                            }
                            {!userLoggedIn &&
                                <Box sx={{flexGrow: 1, display: "flex", gap: "1rem"}} justifyContent="flex-end" >
                                    <Button
                                        type="button"
                                        style={{maxWidth: "100px"}}
                                        id="registerButton"
                                        variant="contained"
                                        sx={{ mt: 2, mb: 2, backgroundColor: 'primary.dark', color: 'white', ':hover': { bgcolor: 'primary.light' } }}
                                        onClick={() => navigate("/login")}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        type="button"
                                        style={{maxWidth: "100px"}}
                                        id="registerButton"
                                        variant="contained"
                                        sx={{ mt: 2, mb: 2, backgroundColor: 'primary.dark', color: 'white', ':hover': { bgcolor: 'primary.light' } }}
                                        onClick={() => navigate("/register")}
                                    >
                                        Register
                                    </Button>
                                </Box>
                            }
                        </>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default Header;