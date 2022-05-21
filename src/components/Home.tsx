import {
    AppBar, Box,
    Button, ButtonBase, Card, CardActionArea, CardActions,
    CardContent,
    CardMedia, Container, createTheme, CssBaseline,
    Grid, Link,
    Stack, ThemeProvider, Toolbar,
    Typography
} from "@mui/material";
import CameraIcon from '@mui/icons-material/PhotoCamera';
import CSS from 'csstype';
import {Copyright} from "@mui/icons-material";
import axios, {AxiosResponse} from "axios";
import React, {ReactEventHandler, SyntheticEvent, useEffect, useState} from "react";
import {Auction} from "../types/Auction";
import defaultAuctionImage from "../static/default-auction.png"
import {useStore} from "../store";
import Header from "./Header";
import {useNavigate} from "react-router-dom";
import {calculateClosingTime} from "../helpers/HelperFunctions";
import Avatar from "@mui/material/Avatar";


const Home = () => {



}
export default Home;