import {useNavigate, useParams} from "react-router-dom";
import Header from "./Header";
import {useStore} from "../store";
import {Auction} from "../types/Auction";
import React, {SyntheticEvent, useEffect, useState} from "react";
import {Card, CardActionArea, CardContent, CardMedia, Container, Grid, Typography} from "@mui/material";
import defaultAuctionImage from "../static/default-auction.png";
import {calculateClosingTime} from "../helpers/HelperFunctions";
import Avatar from "@mui/material/Avatar";

const SpecificAuction = () => {
    const updateAuctions = useStore(state => state.updateAuctions)
    const auctions = useStore(state => state.auctions)
    const [selectedAuction, setSelectedAuction] = useState<Auction>()
    let { auctionId } = useParams();
    const navigate = useNavigate();

    const getAuction = async () => {
        await updateAuctions("")
        let foundAuction = undefined
        console.log(auctions)
        for (let auction of auctions) {
            if (auction.auctionId === parseInt(auctionId as string, 10)) {
                foundAuction = auction
                break;
            }
        }
        if (foundAuction == undefined) {
            setSelectedAuction(auctions.at(1))
            navigate("/auctions")
        } else {
            setSelectedAuction(foundAuction)
        }
    }

    useEffect(() => {
        const checkAuction = async() => {
            await getAuction()
        }
        checkAuction()
            .catch(console.error)
    }, [] )

    return (
        <>
            <Header/>

            <Container sx={{ py: 8 }} maxWidth="xl">
                {selectedAuction !== undefined &&
                    <Grid container spacing={4}>
                        <Grid item key={selectedAuction.auctionId} xs={12} sm={6} md={4}>
                            <Card
                                sx={{
                                    height: '100%', display: 'flex', flexDirection: 'column', ':hover': {
                                        boxShadow: 20
                                    }
                                }}
                            >
                                <CardActionArea
                                    onClick={() => {
                                        navigate(`/auctions/${selectedAuction.auctionId}`)
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        src={`http://localhost:4941/api/v1/auctions/${selectedAuction.auctionId}/image`}
                                        alt="Auction image"
                                        onError={(event: SyntheticEvent<HTMLImageElement>) => event.currentTarget.src = defaultAuctionImage}
                                    />
                                    <CardContent sx={{flexGrow: 1}}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={5} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-start">
                                                <Typography fontSize="14px">
                                                    {"Reserve" + (selectedAuction.highestBid < selectedAuction.reserve ? `: $${selectedAuction.reserve}` : " met")}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-end">
                                                <Typography fontSize="14px">
                                                    {calculateClosingTime(new Date(Date.now()), selectedAuction.endDate)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {selectedAuction.title}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-start">
                                                <Typography fontSize="14px">
                                                    {`Category: ${selectedAuction.categoryName}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-start">
                                                <Typography fontSize="14px">
                                                    {`Current bid: $` + (selectedAuction.highestBid !== null ? selectedAuction.highestBid : "0")}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-end">
                                                <Typography sx={{pr: 2}} fontSize="14px">
                                                    {`Seller: ${selectedAuction.sellerFirstName} ${selectedAuction.sellerLastName}`}
                                                </Typography>
                                                <Avatar
                                                    alt={`${selectedAuction.sellerFirstName} ${selectedAuction.sellerLastName}`}
                                                    src={`http://localhost:4941/api/v1/users/${selectedAuction.sellerId}/image`}/>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                }
            </Container>
        </>
    )
}

export default SpecificAuction