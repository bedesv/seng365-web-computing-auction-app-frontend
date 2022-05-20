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
import React, {useEffect, useState} from "react";
import {Auction} from "../types/Auction";
import defaultAuctionImage from "../static/default-auction.png"
import {useStore} from "../store";
import Header from "./Header";
import {useNavigate} from "react-router-dom";

const card: CSS.Properties = {
    padding: "10px",
    margin: "20px",
}

const Home = () => {
    const [globalError, setGlobalError] = useState('')
    const auctions = useStore(state => state.auctions)
    const updateAuctions = useStore(state => state.updateAuctions)
    const [cardRaised, setCardRaised] = useState(false)
    let searchQuery = useStore(state => state.searchQuery)
    let selectedAuction = useStore(state => state.selectedAuction)
    const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const theme = createTheme();
    const navigate = useNavigate();

    // const getAuctions = () => {
    //     axios.get("http://localhost:4941/api/v1/auctions/", {params: {q: searchQuery}})
    //         .then(response => {
    //             setAuctions(response.data.auctions)
    //         }).catch(err => {
    //             setGlobalError("Error fetching auctions, please try again")
    //         })
    // }
    // useEffect(() => getAuctions(), [] )



    const getAuctionImage = (auctionId: number) => {
        let imageData
        axios.get(`http://localhost:4941/api/v1/auctions/${auctionId}/image`)
            .then((response) => {
                imageData = response
                return response
            }).catch(() => {

                imageData = null
                return null
            })
        if (imageData !== null) {
            return `http://localhost:4941/api/v1/auctions/${auctionId}/image`
        } else {
            return defaultAuctionImage
        }
    }

    function search() {
        updateAuctions(searchQuery)
        navigate("/")
    }

    const seeAuctionDetails = (auctionId: number) => {
        navigate(`/auctions/${auctionId}`)
    }


    return (
        <>
            <Header/>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <main>
                    {/* Hero unit */}
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            pt: 8,
                            pb: 6,
                        }}
                    >
                        <Container maxWidth="sm">
                            <Typography
                                component="h1"
                                variant="h2"
                                align="center"
                                color="text.primary"
                                gutterBottom
                            >
                                Auctions
                            </Typography>
                            {(searchQuery !== "") &&
                                <>
                                    <Typography variant="h5" align="center" color="text.secondary" paragraph>
                                        {`Searching for: "${searchQuery}"`}
                                    </Typography>
                                    <Button
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    sx={{mt: 3, mb: 2}}
                                    onClick={() => {searchQuery = ""; search()}}
                                    >
                                    Clear search
                                    </Button>
                                </>
                            }
                        </Container>
                    </Box>
                    <Container sx={{ py: 8 }} maxWidth="md">
                        {/* End hero unit */}
                        <Grid container spacing={4}>
                            {auctions.map((auction: Auction) => (
                                <Grid item key={auction.auctionId} xs={12} sm={6} md={4}>
                                    <Card
                                        sx={{
                                            height: '100%', display: 'flex', flexDirection: 'column', ':hover': {
                                                boxShadow: 20
                                            }
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => {
                                                navigate("/login")
                                            }}
                                            >
                                            <img
                                                height="200"
                                                width="100%"
                                                style={{margin:'auto'}}
                                                src={`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = defaultAuctionImage
                                                }}
                                                alt="Auction image"
                                            />
                                            <CardContent sx={{flexGrow: 1}}>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {auction.title}
                                                </Typography>
                                                <Typography>
                                                    {auction.reserve}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </main>
            </ThemeProvider>
        </>
    );


}
export default Home;