import {
    AppBar, Box,
    Button, Card, CardActions,
    CardContent,
    CardMedia, Container, createTheme, CssBaseline,
    Grid,
    Stack, ThemeProvider, Toolbar,
    Typography
} from "@mui/material";
import CameraIcon from '@mui/icons-material/PhotoCamera';
import CSS from 'csstype';
import {Copyright} from "@mui/icons-material";
import axios, {AxiosResponse} from "axios";
import {useEffect, useState} from "react";
import {Auction} from "../types/Auction";
import defaultAuctionImage from "../static/default-auction.png"
import {useStore} from "../store";
import Header from "./Header";

const card: CSS.Properties = {
    padding: "10px",
    margin: "20px",
}

const Home = () => {
    const [globalError, setGlobalError] = useState('')
    const auctions = useStore(state => state.auctions)
    const [cardRaised, setCardRaised] = useState(false)
    const searchQuery = useStore(state => state.searchQuery)
    const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const theme = createTheme();

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


    return (
        <>
            <Header/>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AppBar position="relative">
                    <Toolbar>
                        <CameraIcon sx={{ mr: 2 }} />
                        <Typography variant="h6" color="inherit" noWrap>
                            Album layout
                        </Typography>
                    </Toolbar>
                </AppBar>
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
                                Album layout
                            </Typography>
                            <Typography variant="h5" align="center" color="text.secondary" paragraph>
                                Something short and leading about the collection below—its contents,
                                the creator, etc. Make it short and sweet, but not too short so folks
                                don&apos;t simply skip over it entirely.
                            </Typography>
                            <Stack
                                sx={{ pt: 4 }}
                                direction="row"
                                spacing={2}
                                justifyContent="center"
                            >
                                <Button variant="contained">Main call to action</Button>
                                <Button variant="outlined">Secondary action</Button>
                            </Stack>
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
                                        <CardActions>
                                            <Button size="small">View</Button>
                                            <Button size="small">Edit</Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </main>
                {/* Footer */}
                <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
                    <Typography variant="h6" align="center" gutterBottom>
                        Footer
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        align="center"
                        color="text.secondary"
                        component="p"
                    >
                        Something here to give the footer a purpose!
                    </Typography>
                    <Copyright />
                </Box>
                {/* End footer */}
            </ThemeProvider>
        </>
    );


}
export default Home;