import React, {SyntheticEvent} from "react";
import {useStore} from "../store";
import {
    Box,
    Card,
    CardActionArea, CardContent, CardMedia,
    Container,
    createTheme,
    CssBaseline,
    Grid,
    ThemeProvider,
    Typography
} from "@mui/material";
import {useNavigate} from "react-router-dom";
import Header from "./Header";
import {Auction} from "../types/Auction";
import defaultAuctionImage from "../static/default-auction.png";
import {calculateClosingTime, getCategoryName} from "../helpers/HelperFunctions";
import Avatar from "@mui/material/Avatar";
import FilterBar from "./FilterBar";
import Pages from "./Pages";


const Auctions = () => {
    const auctions = useStore(state => state.auctions)
    const categories = useStore(state => state.categories)
    const auctionsOnPage = useStore(state => state.auctionsOnPage)
    const currentPage = useStore(state => state.currentPage)
    const theme = createTheme();
    const navigate = useNavigate();

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
                        </Container>
                    </Box>
                    <Container sx={{ py: 2, boxShadow: 2 }} maxWidth="lg">
                        <FilterBar/>
                        <Grid container spacing={4} sx={{pt: 5}}>
                            <Grid item xs={12} sx={{display: "flex"}} justifyContent={"center"}>
                                <Pages/>
                            </Grid>
                            {auctions.slice(auctionsOnPage * (currentPage - 1), auctionsOnPage * currentPage).map((auction: Auction) => (
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
                                                navigate(`/auctions/${auction.auctionId}`)
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="300"
                                                src={`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`}
                                                alt="Auction image"
                                                onError={(event: SyntheticEvent<HTMLImageElement>) => event.currentTarget.src = defaultAuctionImage}
                                            />
                                            <CardContent sx={{flexGrow: 1}}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={5} style={{display: 'flex', alignItems: 'center'}} justifyContent="flex-start">
                                                        <Typography fontSize="14px">
                                                            {"Reserve" + (auction.highestBid < auction.reserve ? `: $${auction.reserve}` : " met")}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={7} style={{display: 'flex', alignItems: 'center'}} justifyContent="flex-end">
                                                        <Typography fontSize="14px">
                                                            {calculateClosingTime(new Date(Date.now()), auction.endDate)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography gutterBottom variant="h5" component="h2">
                                                            {auction.title}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}} justifyContent="flex-start">
                                                        <Typography fontSize="14px">
                                                            {`Category: ${getCategoryName(auction.categoryId, categories)}`}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}} justifyContent="flex-start">
                                                        <Typography fontSize="18px">
                                                            {`Current bid: $` + (auction.highestBid !== null ? auction.highestBid : "0")}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}} justifyContent="flex-end">
                                                        <Typography sx={{pr: 2}} fontSize="14px">
                                                            {`Seller: ${auction.sellerFirstName} ${auction.sellerLastName}`}
                                                        </Typography>
                                                        <Avatar alt={`${auction.sellerFirstName} ${auction.sellerLastName}`} src={`http://localhost:4941/api/v1/users/${auction.sellerId}/image`}/>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                            <Grid item xs={12} sx={{display: "flex"}} justifyContent={"center"}>
                                <Pages/>
                            </Grid>
                        </Grid>

                    </Container>
                </main>
            </ThemeProvider>
        </>
    );
}

export default Auctions;