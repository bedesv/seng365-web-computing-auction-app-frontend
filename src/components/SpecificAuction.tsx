import {useNavigate, useParams} from "react-router-dom";
import Header from "./Header";
import {useStore} from "../store";
import {Auction} from "../types/Auction";
import React, {SyntheticEvent, useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Container,
    Grid,
    Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField,
    Typography
} from "@mui/material";
import defaultAuctionImage from "../static/default-auction.png";
import {
    calculateClosingTime,
    checkAuctionEnded,
    getAuctionBids,
    getAuctions, getCategory,
    getPrettyDateString
} from "../helpers/HelperFunctions";
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import {Bid} from "../types/Bid";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

const SpecificAuction = () => {
    const categories = useStore(state => state.categories)
    const userToken = useStore(state => state.userToken)
    const userId = useStore(state => state.userId)
    const [selectedAuction, setSelectedAuction] = useState<Auction>()
    const [bids, setBids] = useState([])
    const [similarAuctions, setSimilarAuctions] = useState<Array<Auction>>([])
    const [highestBid, setHighestBid] = useState<Bid>()
    const [auctionEnded, setAuctionEnded] = useState(false)
    const [bidsModalOpen, setBidsModalOpen] = useState(false)
    const [placeBidModalOpen, setPlaceBidModalOpen] = useState(false)
    const [deleteAuctionModalOpen, setDeleteAuctionModalOpen] = useState(false)
    const [deleteAuctionError, setDeleteAuctionError] = useState("")
    const [bidError, setBidError] = useState("")
    const [placeBidError, setPlaceBidError] = useState("")
    const [currentBid, setCurrentBid] = useState("1")
    let { auctionId } = useParams();
    const navigate = useNavigate();

    const getAuction = async () => {
        const foundAuction: Auction = await axios.get(`http://localhost:4941/api/v1/auctions/${auctionId}`)
            .then(response => {
                let auction = response.data
                auction.categoryName = ""
                return auction
            }).catch(() => {
                return undefined
            })

        if (foundAuction !== undefined) {
            for (let category of categories) {
                if (category.categoryId === foundAuction.categoryId) {
                    foundAuction.categoryName = category.name
                    break
                }
            }
            await setSelectedAuction(foundAuction)
            setAuctionEnded(checkAuctionEnded(foundAuction.endDate))
            return foundAuction
        } else {
            navigate("/auctions")
        }
    }
    const getBids = async () => {
        const foundBids = await getAuctionBids(auctionId as string)
        let foundHighestBid;
        if (foundBids.length > 0) {
            foundHighestBid = foundBids.at(0)
            for (let bid of foundBids) {
                if (bid.amount > foundHighestBid.amount) {
                    foundHighestBid = bid
                }
            }
            setHighestBid(foundHighestBid)
            setCurrentBid(`${foundHighestBid.amount + 1}`)
        } else {
            setHighestBid(undefined)
        }
        setBids(foundBids)
    }
    const getSimilarAuctions = async (foundAuction: Auction) => {
        let allAuctions = await getAuctions()
        let foundSimilarAuctions = []

        for (let auction of allAuctions) {
            if ((auction.categoryId === foundAuction.categoryId
                    || auction.sellerId === foundAuction.sellerId)
                && auction.auctionId !== foundAuction.auctionId) {
                foundSimilarAuctions.push(auction)
            }
        }
        await setSimilarAuctions(foundSimilarAuctions)
    }

    useEffect(() => {

        getAuction().then((foundAuction) => {
            getBids().then()
            if (foundAuction !== undefined) {
                getSimilarAuctions(foundAuction).then()
            }
        })
    }, [auctionId, navigate])

    const handleBidsModalOpen = () => {setBidsModalOpen(true)}

    const handleBidsModalClose = () => {setBidsModalOpen(false)}

    const handleDeleteAuctionModalOpen = () => {setDeleteAuctionModalOpen(true)}

    const handleDeleteAuctionModalClose = () => {setDeleteAuctionModalOpen(false)}

    const handlePlaceBidModalOpen = () => {
        if (userToken === "" || userId === -1) {
            navigate("/login")
            return
        }
        setPlaceBidModalOpen(true)
    }

    const handlePlaceBidModalClose = () => {setPlaceBidModalOpen(false)}

    const checkBid = (bid: string) => {
        const highestBidValue = highestBid ? highestBid.amount : 0
        if (Number.isNaN(Number(bid)) || bid.includes(".")) {
            setCurrentBid(currentBid)
            return false
        }
        setCurrentBid(bid)

        if (Number(bid) <= highestBidValue) {
            setBidError("Error: Bid must be more than the current bid of $" + highestBidValue)
            return false
        } else {
            setBidError("")
            return true
        }
    }

    const handleDeleteAuction = async () => {

        const requestHeaders = {
            headers: {
                "X-Authorization": userToken
            }
        }
        const deleteAuctionResponse = await axios.delete(`http://localhost:4941/api/v1/auctions/${auctionId}`,requestHeaders)
            .then((response) => {
                return response
            }).catch((err) => {
                return err.response
            })

        if (deleteAuctionResponse.status === 200) {
            setDeleteAuctionError("")
            setDeleteAuctionModalOpen(false)
            navigate("/")
            return
        } else {
            setDeleteAuctionError("Server Error: Please try again")
        }
    }


    const placeBid = async () => {
        if (!checkBid(currentBid)) {
            return
        }
        const requestHeaders = {
            headers: {
                "X-Authorization": userToken
            }
        }
        const placeBidResponse = await axios.post(`http://localhost:4941/api/v1/auctions/${auctionId}/bids`, {amount: parseInt(currentBid)}, requestHeaders)
            .then(response => {
                return response.status
            }).catch(err => {
                return err.response.status
            })
        if (placeBidResponse === 201) {
            setPlaceBidError("")
            handlePlaceBidModalClose()
            await getBids()
        } else if (placeBidResponse === 403) {
            setPlaceBidError("Error: Someone else placed a bid before you")
            await getBids()
        } else {
            setPlaceBidError("Server Error: Please try again")
        }

    }

    return (
        <>
            <Header/>

            <Container sx={{ py: 8}} maxWidth="lg">
                {selectedAuction !== undefined &&
                    <Card>
                        <Grid container>
                            <Grid item xs={2} sm={6} md={3} style={{display: 'block', gap: "1rem", height: "auto"}}
                                  sx={{pl: 2, pt: 2}} justifyContent="flex-start">
                                <img
                                    width={"100%"}
                                    height={"auto"}
                                    src={`http://localhost:4941/api/v1/auctions/${selectedAuction.auctionId}/image`}
                                    alt="Auction"
                                    onError={(event: SyntheticEvent<HTMLImageElement>) => event.currentTarget.src = defaultAuctionImage}/>
                            </Grid>
                            <Grid item xs={9} style={{display: 'flex'}}>
                                <Grid container>
                                    <Grid item xs={6} style={{display: 'flex', alignItems: 'center'}}
                                          justifyContent="flex-start">
                                        <Typography gutterBottom variant="h5" component="h2" sx={{pl: 2, pt: 1}}>
                                            {selectedAuction.title}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} style={{display: 'flex'}} justifyContent="flex-start">
                                        <Typography fontSize="14px" sx={{pt: 1, pl: 5}} align="left">
                                            {calculateClosingTime(new Date(Date.now()), selectedAuction.endDate)} <br/>
                                            {getPrettyDateString(selectedAuction.endDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} textAlign={"left"}>
                                        <Typography fontSize="14px" sx={{pl: 2}}>
                                            {`Category: ${getCategory(selectedAuction.categoryId, categories)}`}
                                        </Typography>
                                        <Typography fontSize="18px" sx={{pl: 2, pt: 2}}>
                                            {`Reserve: $${selectedAuction.reserve}`}
                                        </Typography>
                                        <Typography fontSize="12px" sx={{pl: 2}}>
                                            {"Reserve " + (highestBid === undefined || highestBid.amount < selectedAuction.reserve ? "not met" : "met")}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} style={{display: 'flex', alignItems: 'center'}}
                                          justifyContent="flex-start">
                                        <Typography fontSize="14px" align="left" sx={{pt: 2, pl: 5}}>
                                            {`${bids.length} ` + (bids.length === 1 ? "bid" : "bids")}<br/>
                                            {`Current bid: $` + (highestBid !== undefined ? highestBid.amount : "0")}<br/>
                                            {highestBid !== undefined && `Placed by ${highestBid.firstName} ${highestBid.lastName}`}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography fontSize="14px" sx={{pl: 2, pt: 2}} align="left">
                                            {selectedAuction.description}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} style={{display: 'flex', alignItems: 'start'}} justifyContent="flex-start">
                                        <Button type={"button"} variant="contained" sx={{mt: 2, ml: 5}} onClick={handleBidsModalOpen}>
                                            View Bids
                                        </Button>
                                        {!auctionEnded && selectedAuction.sellerId !== userId &&
                                            <Button type={"button"} variant="contained" sx={{mt: 2, ml: 2}} onClick={handlePlaceBidModalOpen}>
                                                Place Bid
                                            </Button>
                                        }
                                        {bids.length === 0 && selectedAuction.sellerId === userId &&
                                            <Button type={"button"} variant="contained" sx={{mt: 2, ml: 2}} onClick={handleDeleteAuctionModalOpen}>
                                                Delete Auction
                                            </Button>
                                        }
                                        <Modal
                                            open={bidsModalOpen}
                                            onClose={handleBidsModalClose}
                                        >
                                            <Box sx={style}>
                                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                                    Bids
                                                </Typography>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Amount</TableCell>
                                                                <TableCell align="center">Time</TableCell>
                                                                <TableCell align="right">User</TableCell>
                                                                <TableCell/>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {bids.map((bid: Bid) => (
                                                                <TableRow
                                                                    key={bid.amount}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        {bid.amount}
                                                                    </TableCell>
                                                                    <TableCell align="right">{getPrettyDateString(bid.timestamp)}</TableCell>
                                                                    <TableCell align="right">
                                                                        <Typography sx={{pr: 2}} fontSize="14px">
                                                                            {`${bid.firstName} ${bid.lastName}`}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <Avatar
                                                                            alt={`${bid.firstName} ${bid.lastName}`}
                                                                            src={`http://localhost:4941/api/v1/users/${bid.bidderId}/image`}/>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        </Modal>
                                        <Modal
                                            open={placeBidModalOpen}
                                            onClose={handlePlaceBidModalClose}
                                        >
                                            <Box sx={style}>
                                                <Grid container>
                                                    <Grid item xs={1}/>
                                                    <Grid item xs={11} style={{display: 'flex', alignItems: 'top'}} justifyContent={"flex-start"}>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" >
                                                            Place Bid
                                                        </Typography> <br/>
                                                    </Grid>
                                                    <Grid item xs={1}/>
                                                    <Grid item xs={11} style={{display: 'flex', alignItems: 'top'}} justifyContent={"flex-start"}>
                                                        <Typography variant="h6" color="error.main">
                                                            {placeBidError}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={1} style={{display: 'flex', alignItems: 'center'}} justifyContent={"flex-center"}>
                                                        <Typography fontSize="20px">
                                                            $
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={7} >
                                                        <TextField type="text"
                                                                   value={currentBid}
                                                                   onChange={e => checkBid(e.target.value)}
                                                                   error={bidError !== ''}
                                                                   helperText={bidError}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={4} style={{display: 'flex', alignItems: 'center'}} justifyContent={"flex-start"}>
                                                        <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={placeBid}>
                                                            Place Bid
                                                        </Button>
                                                    </Grid>

                                                </Grid>
                                            </Box>
                                        </Modal>

                                        <Modal
                                            open={deleteAuctionModalOpen}
                                            onClose={handleDeleteAuctionModalClose}
                                        >
                                            <Box sx={style}>
                                                <Grid container>
                                                    <Grid item xs={12}>
                                                        <Typography variant="h6" color="error.main">
                                                            {deleteAuctionError}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                                            Are you sure you want to delete this auction
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sx={{display: "flex", align:"center"}}>
                                                        <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={handleDeleteAuctionModalClose}>
                                                            No
                                                        </Button>
                                                        <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={handleDeleteAuction}>
                                                            Yes, I want to delete this auction
                                                        </Button>
                                                    </Grid>
                                                </Grid>


                                            </Box>
                                        </Modal>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}} sx={{pr: 3, pb: 3}}
                                      justifyContent="flex-end">
                                    <Typography sx={{pr: 2}} fontSize="14px">
                                        {`Seller: ${selectedAuction.sellerFirstName} ${selectedAuction.sellerLastName}`}
                                    </Typography>
                                    <Avatar
                                        alt={`${selectedAuction.sellerFirstName} ${selectedAuction.sellerLastName}`}
                                        src={`http://localhost:4941/api/v1/users/${selectedAuction.sellerId}/image`}/>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Card>
                }
            </Container>
            <Container sx={{ py: 1 }} maxWidth="lg">
                <Typography sx={{pb: 5}} gutterBottom variant="h5" component="h2">
                    {similarAuctions.length > 0 ? "Similar Auctions" : "No Similar Auctions Found"}
                </Typography>
                <Grid container spacing={4}>
                    {similarAuctions.map((auction: Auction) => (
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
                                        navigate(`/auctions/${auction.auctionId}`);
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        src={`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`}
                                        alt="Auction image"
                                        onError={(event: SyntheticEvent<HTMLImageElement>) => event.currentTarget.src = defaultAuctionImage}/>
                                    <CardContent sx={{flexGrow: 1}}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={5} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-start">
                                                <Typography fontSize="14px">
                                                    {"Reserve" + (auction.highestBid < auction.reserve ? `: $${auction.reserve}` : " met")}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-end">
                                                <Typography fontSize="14px">
                                                    {calculateClosingTime(new Date(Date.now()), auction.endDate)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {auction.title}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-start">
                                                <Typography fontSize="14px">
                                                    {`Category: ${getCategory(auction.categoryId, categories)}`}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-start">
                                                <Typography fontSize="14px">
                                                    {`Current bid: $` + (auction.highestBid !== null ? auction.highestBid : "0")}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} style={{display: 'flex', alignItems: 'center'}}
                                                  justifyContent="flex-end">
                                                <Typography sx={{pr: 2}} fontSize="14px">
                                                    {`Seller: ${auction.sellerFirstName} ${auction.sellerLastName}`}
                                                </Typography>
                                                <Avatar alt={`${auction.sellerFirstName} ${auction.sellerLastName}`}
                                                        src={`http://localhost:4941/api/v1/users/${auction.sellerId}/image`}/>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    )
}

export default SpecificAuction