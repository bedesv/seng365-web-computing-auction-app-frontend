import {useNavigate, useParams} from "react-router-dom";
import Header from "./Header";
import {useStore} from "../store";
import {Auction} from "../types/Auction";
import React, {SyntheticEvent, useEffect, useState} from "react";
import {
    Badge,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Container, FormControl, FormHelperText,
    Grid, InputLabel, ListItemText, MenuItem,
    Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField, Tooltip,
    Typography
} from "@mui/material";
import defaultAuctionImage from "../static/default-auction.png";
import {
    acceptedImageFileTypes,
    calculateClosingTime,
    checkAuctionEnded, convertDateStringForInput,
    getAuctionBids,
    getAuctions, getCategoryId, getCategoryName,
    getPrettyDateString, isEmptyOrSpaces
} from "../helpers/HelperFunctions";
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import {Bid} from "../types/Bid";
import {DriveFileRenameOutlineSharp} from "@mui/icons-material";

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
    const [editAuctionModalOpen, setEditAuctionModalOpen] = useState(false)
    const [auctionTitle, setAuctionTitle] = useState("");
    const [auctionDescription, setAuctionDescription] = useState("");
    const [auctionCategory, setAuctionCategory] = useState("");
    const [auctionEndDate, setAuctionEndDate] = useState(convertDateStringForInput(new Date(Date.now())));
    const [auctionImage, setAuctionImage] = useState(null);
    const [auctionReserve, setAuctionReserve] = useState("1");
    const [auctionTitleError, setAuctionTitleError] = useState("")
    const [auctionDescriptionError, setAuctionDescriptionError] = useState("")
    const [auctionReserveError, setAuctionReserveError] = useState("")
    const [auctionCategoryError, setAuctionCategoryError] = useState("")
    const [auctionEndDateError, setAuctionEndDateError] = useState("")
    const [auctionImageError, setAuctionImageError] = useState("")
    const [auctionImagePreview, setAuctionImagePreview] = useState<string>(defaultAuctionImage)
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
            resetEditAuctionFields(foundAuction)
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
        refreshAuctionPage()
    }, [auctionId])

    const refreshAuctionPage = () => {
        getAuction().then((foundAuction) => {
            getBids().then()
            if (foundAuction !== undefined) {
                getSimilarAuctions(foundAuction).then()
            }
        })
    }

    const handleBidsModalOpen = () => {setBidsModalOpen(true)}

    const handleBidsModalClose = () => {setBidsModalOpen(false)}

    const handleDeleteAuctionModalOpen = () => {setDeleteAuctionModalOpen(true)}

    const handleDeleteAuctionModalClose = () => {
        setDeleteAuctionModalOpen(false)
        if (deleteAuctionError === "Error: Client authentication mismatch, please close the popup and try again") {
            navigate("/login")
        } else {
            setDeleteAuctionError("")
            refreshAuctionPage()
        }

    }

    const handleEditAuctionModalOpen = () => {setEditAuctionModalOpen(true)}

    const handleEditAuctionModalClose = () => {
        resetEditAuctionFields(selectedAuction as Auction)
        setEditAuctionModalOpen(false)
        refreshAuctionPage()
    }

    const handlePlaceBidModalOpen = () => {
        if (userToken === "" || userId === -1) {
            navigate("/login")
            return
        }
        setPlaceBidModalOpen(true)
    }

    const handlePlaceBidModalClose = () => {
        setPlaceBidModalOpen(false)
        refreshAuctionPage()
    }

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
        const deleteAuctionResponse = await axios.delete(`http://localhost:4941/api/v1/auctions/${auctionId}`, requestHeaders)
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
        } else if (deleteAuctionResponse.status === 403) {
            console.log(deleteAuctionResponse.statusText)
            if (deleteAuctionResponse.statusText === "Cannot delete auction after bid has been placed") {
                setDeleteAuctionError("Error: You cannot delete an auction that has bids")
            } else {
                setDeleteAuctionError("Error: Client authentication mismatch, please close the popup and try again")
            }
        } else if (deleteAuctionResponse.status === 401) {
            setDeleteAuctionError("Error: Client authentication mismatch, please close the popup and try again")
        } else if (deleteAuctionResponse.status === 404) {
            setDeleteAuctionError("Error: Auction not found, please refresh the page and try again")
        } else {
            setDeleteAuctionError("Server Error: Please try again")
        }
    }

    function uploadAuctionImage(e: any) {
        const auctionImage = e.target.files[0]
        setAuctionImage(auctionImage)
        if (auctionImage !== undefined && acceptedImageFileTypes.includes(auctionImage.type)) {
            const auctionImagePath = URL.createObjectURL(auctionImage)
            setAuctionImagePreview(auctionImagePath)
            setAuctionImageError("")
        }
    }

    const checkEditAuctionErrors = () => {
        const titleErrors = checkAuctionTitleErrors(auctionTitle)
        const descriptionErrors = checkAuctionDescriptionErrors(auctionDescription)
        const reserveErrors = checkAuctionReserveErrors(auctionReserve)
        const categoryErrors = checkAuctionCategoryErrors(auctionCategory)
        const endDateErrors = checkAuctionEndDateErrors(auctionEndDate)

        return titleErrors && descriptionErrors && reserveErrors && categoryErrors && endDateErrors
    }

    const resetEditAuctionErrors = () => {
        setAuctionTitleError("")
        setAuctionDescriptionError("")
        setAuctionReserveError("")
        setAuctionCategoryError("")
        setAuctionEndDateError("")
        setAuctionImageError("")

    }

    const resetEditAuctionFields = (auction: Auction) => {
        setAuctionTitle(auction.title)
        setAuctionDescription(auction.description)
        setAuctionCategory(getCategoryName(auction.categoryId, categories))
        setAuctionReserve(auction.reserve.toString())
        setAuctionEndDate(convertDateStringForInput(new Date(auction.endDate)))
        setAuctionImage(null)
        setAuctionImagePreview(`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`)
        resetEditAuctionErrors()
    }

    const checkAuctionTitleErrors = (newAuctionTitle: string) => {
        if (newAuctionTitle.length < 1 || newAuctionTitle.length > 128) {
            setAuctionTitleError("Error: Auction title must be between 1 and 128 characters")
        } else if (isEmptyOrSpaces(newAuctionTitle)) {
            setAuctionTitleError("Error: Auction title must not be blank")
        } else {
            setAuctionTitleError('')
            return true
        }
        return false
    }

    const checkAuctionDescriptionErrors = (newAuctionDescription: string) => {
        if (newAuctionDescription.length < 1 || newAuctionDescription.length > 2048) {
            setAuctionDescriptionError("Error: Auction description must be between 1 and 2048 characters")
        } else if (isEmptyOrSpaces(newAuctionDescription)) {
            setAuctionDescriptionError("Error: Auction description must not be blank")
        } else {
            setAuctionDescriptionError('')
            return true
        }
        return false
    }

    const checkAuctionReserveErrors = (newAuctionReserve: string) => {
        if (Number.isNaN(Number(newAuctionReserve)) || newAuctionReserve.includes(".")) {
            setAuctionReserve(auctionReserve)
            return false
        }
        setAuctionReserve(newAuctionReserve)

        if (Number(newAuctionReserve) < 1) {
            setAuctionReserveError("Error: Auction reserve must be at least $1")
        } else if (Number(newAuctionReserve) > 99999999999) {
            setAuctionReserveError("Error: Auction reserve must be less than $99,999,999,999")
        } else {
            setAuctionReserveError('')
            return true
        }
        return false
    }

    const checkAuctionCategoryErrors = (newAuctionCategory: string) => {
        if (newAuctionCategory === "") {
            setAuctionCategoryError("Error: Please select a category")
            return false
        } else {
            setAuctionCategoryError("")
        }
        return true
    }

    const checkAuctionEndDateErrors = (newAuctionEndDate: string) => {
        if (checkAuctionEnded(new Date(newAuctionEndDate).toISOString())) {
            setAuctionEndDateError("Error: Auction end date must be in the future")
        } else {
            setAuctionEndDateError("")
            return true
        }
        return false
    }

    const handleAuctionTitleChanged = (newAuctionTitle: string) => {
        checkAuctionTitleErrors(newAuctionTitle)
        setAuctionTitle(newAuctionTitle)
    }

    const handleAuctionDescriptionChanged = (newAuctionDescription: string) => {
        checkAuctionDescriptionErrors(newAuctionDescription)
        setAuctionDescription(newAuctionDescription)
    }

    const handleAuctionReserveChanged = (newAuctionReserve: string) => {
        checkAuctionReserveErrors(newAuctionReserve)
    }

    const handleAuctionCategoryChanged = (newAuctionCategory: string) => {
        checkAuctionCategoryErrors(newAuctionCategory)
        setAuctionCategory(newAuctionCategory)
    }

    const handleEndDateChanged = (newAuctionEndDate: string) => {
        checkAuctionEndDateErrors(newAuctionEndDate)
        setAuctionEndDate(convertDateStringForInput(new Date(newAuctionEndDate)))
    }

    const editAuction = async () => {
        if (!checkEditAuctionErrors()) {
            return
        }

        const auctionCategoryId = getCategoryId(auctionCategory, categories)

        return await axios.patch(`http://localhost:4941/api/v1/auctions/${auctionId}`, {
            "title": auctionTitle,
            "description": auctionDescription,
            "reserve": auctionReserve,
            "categoryId": auctionCategoryId,
            "endDate": auctionEndDate
        }, {headers: {"X-Authorization": userToken}})
            .then((response) => {
                console.log(response)
                return response.status
            })
            .catch((err) => {
                handleEditAuctionErrors(err.response.status, err.response.statusText)
                console.log(err.response)
                return err.response.status
            })
    }

    const saveAuctionImage = async (auctionImage: any, auctionId: number) => {
        let auctionImageType = auctionImage.type

        if (auctionImageType === 'image/jpg') {
            auctionImageType = 'image/jpeg'
        }

        const requestHeaders = {
            headers: {
                "content-type": auctionImageType,
                "X-Authorization": userToken
            }
        }
        const saveAuctionImageResponse =  await axios.put(`http://localhost:4941/api/v1/auctions/${auctionId}/image`, auctionImage, requestHeaders)
            .then((response) => {
                return response
            })
            .catch((err) => {
                setAuctionImageError("Error saving auction image: Please try again in the auction details page")
                return err.response
            })
        return saveAuctionImageResponse.status
    }

    const handleEditAuctionErrors = (resStatus: number, resText: string) => {
        if (resStatus === 400) {
            if (resText === "Invalid categoryId") {
                setAuctionCategoryError("Error: Invalid category id")
                return
            }
        }
        if (resStatus === 403) {
            if (resText === "Duplicate entry") {
                setAuctionTitleError("Error: Auction title is the same as another auction")
                return
            } else if (resText === "Cannot edit auction after bid has been placed") {
                setAuctionImageError("Error: You cannot edit an auction that has bids")
            } else {
                setAuctionImageError("Error: Client authentication mismatch, please close the popup and try again")
            }
        } else if (resStatus === 401) {
            setAuctionImageError("Error: Client authentication mismatch, please close the popup and try again")
        } else if (resStatus === 404) {
            setDeleteAuctionError("Error: Auction not found, please refresh the page and try again")
        } else {
            setAuctionImageError("Server Error: Please try again")
        }
    }

    const handleEditAuctionSubmit = async () => {
        const editAuctionResponse = await editAuction()
        if (editAuctionResponse !== 200) {
            return
        }

        if (auctionImage !== null) {
            console.log("Image")
            const saveAuctionImageResponse = await saveAuctionImage(auctionImage, parseInt(auctionId as string, 10))
            if (saveAuctionImageResponse !== 200) {
                setAuctionImageError("Server Error: Please try again")
                return
            }
        }

        handleEditAuctionModalClose()
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
                            <Grid item xs={2} style={{display: 'block', gap: "1rem", height: "auto"}}
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
                                            {`Category: ${getCategoryName(selectedAuction.categoryId, categories)}`}
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
                                            <Button type={"button"} variant="contained" sx={{mt: 2, ml: 2}} onClick={handleEditAuctionModalOpen}>
                                                Edit Auction
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
                                        <Modal
                                            open={editAuctionModalOpen}
                                            onClose={handleEditAuctionModalClose}
                                        >
                                            <Box sx={style}>
                                                <Box sx={style}>


                                                    <Grid container spacing={2}>
                                                        <Grid sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} item xs={12}>
                                                            <Badge
                                                                overlap="circular"
                                                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                                                badgeContent={
                                                                    <>
                                                                        <Tooltip title="Upload Auction Image">
                                                                            <label htmlFor="file-input">
                                                                                <DriveFileRenameOutlineSharp sx={{cursor: "pointer"}} color='primary' />
                                                                            </label>
                                                                        </Tooltip>
                                                                        <input hidden type="file" accept=".jpg,.jpeg,.png,.gif" id="file-input" onChange={(e) => uploadAuctionImage(e)}/>
                                                                    </>
                                                                }>
                                                                <img
                                                                    height={"400"}
                                                                    src={auctionImagePreview}
                                                                    alt="Auction"
                                                                    onError={(event: SyntheticEvent<HTMLImageElement>) => event.currentTarget.src = defaultAuctionImage}/>
                                                            </Badge>
                                                        </Grid>
                                                        <Grid item xs={12} sx={{display: "flex", alignItems: 'center'}} justifyContent={"center"}>
                                                            <Typography color="error.main">
                                                                {auctionImageError}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                name="title"
                                                                required
                                                                fullWidth
                                                                id="title"
                                                                label="Title"
                                                                autoFocus
                                                                value={auctionTitle}
                                                                onChange={e => handleAuctionTitleChanged(e.target.value)}
                                                                error={auctionTitleError !== ''}
                                                                helperText={auctionTitleError}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                required
                                                                multiline
                                                                fullWidth
                                                                id="description"
                                                                label="Description"
                                                                name="description"
                                                                value={auctionDescription}
                                                                onChange={e => handleAuctionDescriptionChanged(e.target.value)}
                                                                error={auctionDescriptionError !== ''}
                                                                helperText={auctionDescriptionError}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                fullWidth
                                                                id="reserve"
                                                                label="Reserve"
                                                                name="reserve"
                                                                value={auctionReserve}
                                                                onChange={e => handleAuctionReserveChanged(e.target.value)}
                                                                error={auctionReserveError !== ''}
                                                                helperText={auctionReserveError}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <Typography fontSize="20px">
                                                                            $
                                                                        </Typography>
                                                                    ),
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <FormControl
                                                                fullWidth
                                                                error={auctionCategoryError !== ""}
                                                            >
                                                                <InputLabel id="category-label">Category</InputLabel>
                                                                <Select
                                                                    value={auctionCategory}
                                                                    onChange={e => handleAuctionCategoryChanged(e.target.value)}
                                                                    labelId={"category-label"}
                                                                    MenuProps={{PaperProps: {sx: {maxHeight: 300}}}}
                                                                    // error={auctionCategoryError !== ''}
                                                                >
                                                                    {categories.map((category: { categoryId: number; name: string; }) => (
                                                                        <MenuItem
                                                                            key={category.categoryId}
                                                                            value={category.name}
                                                                        >
                                                                            <ListItemText primary={category.name}/>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                                <FormHelperText>{auctionCategoryError}</FormHelperText>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={12} >
                                                            <TextField
                                                                fullWidth
                                                                id="datetime-local"
                                                                label="Auction End Date"
                                                                type="datetime-local"
                                                                value={auctionEndDate}
                                                                onChange={e => handleEndDateChanged(e.target.value)}
                                                                error={auctionEndDateError !== ''}
                                                                helperText={auctionEndDateError}
                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sx={{display: "flex", align:"center"}}>
                                                            <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={handleEditAuctionModalClose}>
                                                                Discard
                                                            </Button>
                                                            <Button type={"button"} variant="contained" sx={{ ml: 2}} onClick={handleEditAuctionSubmit}>
                                                                Save Changes
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
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
                                                    {`Category: ${getCategoryName(auction.categoryId, categories)}`}
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