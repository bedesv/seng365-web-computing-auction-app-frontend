import React, {SyntheticEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useStore} from "../store";
import Header from "./Header";
import {
    Badge,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Container,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    Modal,
    Select,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {Auction} from "../types/Auction";
import defaultAuctionImage from "../static/default-auction.png";
import {
    acceptedImageFileTypes,
    calculateClosingTime,
    checkAuctionEnded,
    convertDateStringForInput,
    getAuctionsUserBiddedOn,
    getCategory,
    getCategoryId,
    getUsersAuctions,
    isEmptyOrSpaces
} from "../helpers/HelperFunctions";
import Avatar from "@mui/material/Avatar";
import {DriveFileRenameOutlineSharp} from "@mui/icons-material";
import axios from "axios";

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

const MyAuctions = () => {
    const navigate = useNavigate();
    const auctions = useStore(state => state.auctions)
    const userLoggedIn = useStore(state => state.loggedIn)
    const categories = useStore(state => state.categories)
    const userToken = useStore(state => state.userToken)
    const [usersAuctions, setUsersAuctions] = useState<Auction[]>([])
    const [auctionsUserBiddedOn, setAuctionsUserBiddedOn] = useState<Auction[]>([])
    const [createAuctionModelOpen, setCreateAuctionModelOpen] = useState(false)
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
    const userId = useStore(state => state.userId)

    useEffect(() => {
        if (!userLoggedIn) {
            navigate("/")
        }
        getUsersAuctions(userId).then(foundAuctions => setUsersAuctions(foundAuctions))
        getAuctionsUserBiddedOn(userId).then(foundAuctions => setAuctionsUserBiddedOn(foundAuctions))
    }, [userLoggedIn, navigate, auctions] )

    const handleCreateAuctionModalOpen = () => {
        setCreateAuctionModelOpen(true)
        setAuctionEndDate(convertDateStringForInput(new Date(Date.now())))
    }

    const handleCreateAuctionModalClose = () => {setCreateAuctionModelOpen(false)}

    function uploadAuctionImage(e: any) {
        const auctionImage = e.target.files[0]
        setAuctionImage(auctionImage)
        if (auctionImage !== undefined && acceptedImageFileTypes.includes(auctionImage.type)) {
            const auctionImagePath = URL.createObjectURL(auctionImage)
            setAuctionImagePreview(auctionImagePath)
            setAuctionImageError("")
        }
    }

    const checkErrors = () => {
        const titleErrors = checkAuctionTitleErrors(auctionTitle)
        const descriptionErrors = checkAuctionDescriptionErrors(auctionDescription)
        const reserveErrors = checkAuctionReserveErrors(auctionReserve)
        const categoryErrors = checkAuctionCategoryErrors(auctionCategory)
        const endDateErrors = checkAuctionEndDateErrors(auctionEndDate)
        const imageErrors = checkAuctionImageErrors()

        return titleErrors && descriptionErrors && reserveErrors && categoryErrors && endDateErrors && imageErrors
    }

    const resetNewAuctionFields = () => {
        setAuctionTitle("")
        setAuctionDescription("")
        setAuctionReserve("1")
        setAuctionCategory("")
        setAuctionEndDate(convertDateStringForInput(new Date(Date.now())))
        setAuctionImagePreview(defaultAuctionImage)
        setAuctionImage(null)
    }

    const checkAuctionImageErrors = () => {
        if (auctionImage === null || auctionImagePreview === defaultAuctionImage) {
            setAuctionImageError("Error: Please upload an auction image")
            return false
        } else {
            setAuctionImageError("")
        }
        return true
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

    const handleCreateAuctionErrors = (resStatus: number, resText: string) => {
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
            }
        }
        setAuctionImageError("Server Error: Please try again")
    }

    const createAuction = async () => {
        if (!checkErrors()) {
            return
        }

        const auctionCategoryId = getCategoryId(auctionCategory, categories)

        return await axios.post('http://localhost:4941/api/v1/auctions', {
            "title": auctionTitle,
            "description": auctionDescription,
            "reserve": auctionReserve,
            "categoryId": auctionCategoryId,
            "endDate": auctionEndDate
        }, {headers: {"X-Authorization": userToken}})
            .then((response) => {
                return response
        })
            .catch((err) => {
                handleCreateAuctionErrors(err.response.status, err.response.statusText)
                return err.response
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

    const handleCreateAuctionSubmit = async () => {
        const createAuctionResponse = await createAuction()
        if (createAuctionResponse.status !== 201) {
            return
        }
        const auctionId = createAuctionResponse.data.auctionId

        const saveAuctionImageResponse = await saveAuctionImage(auctionImage, auctionId)
        console.log(saveAuctionImageResponse)
        resetNewAuctionFields()
        handleCreateAuctionModalClose()
        setUsersAuctions(await getUsersAuctions(userId))
    }

    return (
        <>
            <Header/>
            <Container sx={{ py: 1, pt: 5}} maxWidth="lg">
                <Typography sx={{pb: 5}} gutterBottom variant="h5" component="h2">
                    {usersAuctions.length > 0 ? "Your auctions" : "You don't have any auctions. \nCreate one using the button below"}
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} >
                            <Button type={"button"} variant="contained" onClick={handleCreateAuctionModalOpen}>
                                Create Auction
                            </Button>
                        <Modal
                            open={createAuctionModelOpen}
                            onClose={handleCreateAuctionModalClose}
                        >
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
                                                width={"100%"}
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
                                </Grid>
                                <Button
                                    type="button"
                                    fullWidth
                                    id="createAuctionButton"
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    onClick={() => handleCreateAuctionSubmit()}
                                >
                                    Create Auction
                                </Button>
                            </Box>
                        </Modal>
                    </Grid>
                    {usersAuctions.map((auction: Auction) => (
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
            <Container sx={{ py: 1, pt: 5}} maxWidth="lg">
                <Typography sx={{pb: 5}} gutterBottom variant="h5" component="h2">
                    {auctionsUserBiddedOn.length > 0 ? "Auctions you've bid on" : "You haven't bid on any auctions"}
                </Typography>
                <Grid container spacing={4}>
                    {auctionsUserBiddedOn.map((auction: Auction) => (
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
export default MyAuctions