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
import {TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useStore} from "../store";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const Header = () => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [searchBoxText, setSearchBoxText] = useState("")
    let searchQuery = useStore(state => state.searchQuery)
    const userLoggedIn = useStore(state => state.loggedIn)
    const userProfilePicture = useStore(state => state.userProfilePicture)
    const logoutUser = useStore(state => state.logout)
    const updateAuctions = useStore(state => state.updateAuctions)
    const navigate = useNavigate();

    useEffect(() => {
        updateAuctions(searchQuery)
    }, [updateAuctions, searchQuery] )

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    function search() {
        updateAuctions(searchBoxText)
        navigate("/auctions")
    }

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
                    <Box sx={{flexGrow: 1, display: "flex", gap: "1rem", justifyContent: 'flex-end'}}>
                        <Box sx={{ flexGrow: 0, display: {xs: 'flex', md: 'flex'}, mr: 5, ml: 1, mt: 2, mb: 2, p: 0.1, borderRadius: 1}} bgcolor="white">
                            <form onSubmit={async (e: { preventDefault: () => void; }) => {
                                await search();
                                e.preventDefault()
                            }}>
                                <TextField
                                    id="search-bar"
                                    className="text"
                                    onChange={e => {setSearchBoxText(e.target.value)}}
                                    variant="outlined"
                                    defaultValue={searchQuery}
                                    placeholder="Search..."
                                    size="small"
                                />
                                <IconButton type="button" aria-label="search" onClick={search}>
                                    <SearchIcon style={{ fill: "blue" }} />
                                </IconButton>
                            </form>
                        </Box>
                        <>
                            {userLoggedIn &&
                                <Box sx={{flexGrow: 0, display: "flex", gap: "1rem"}}>
                                    <Tooltip title="User Options">
                                        <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                            <Avatar alt="Remy Sharp" src={userProfilePicture}/>
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
                                            navigate("/profile")
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
                                <Box sx={{flexGrow: 0, display: "flex", gap: "1rem"}}>
                                    <Button
                                        type="button"
                                        fullWidth
                                        id="registerButton"
                                        variant="contained"
                                        sx={{ mt: 2, mb: 2, backgroundColor: 'primary.dark', color: 'white', ':hover': { bgcolor: 'primary.light' } }}
                                        onClick={() => navigate("/login")}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        type="button"
                                        fullWidth
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
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default Header;