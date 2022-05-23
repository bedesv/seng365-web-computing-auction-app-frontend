import Box from "@mui/material/Box";
import {
    AppBar, Button, Checkbox,
    Container, FormControl, Grid, InputLabel, ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Toolbar
} from "@mui/material";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {useStore} from "../store";

const sortOrders = ["Closing Date - Asc", "Closing Date - Desc", "Title - Asc", "Title - Desc", "Current Bid - Asc", "Current Bid - Desc", "Reserve - Asc", "Reserve - Desc"]

const FilterBar = () => {
    const [searchBoxText, setSearchBoxText] = useState("")
    const [categoryNames, setCategoryNames] = useState<string[]>([]);
    const [openClosed, setOpenClosed] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState(sortOrders.at(0))
    const updateAuctions = useStore(state => state.updateAuctions)
    const categories = useStore(state => state.categories)

    const navigate = useNavigate();

    function search() {
        let auctionOpenClosed = -1;
        if (openClosed.length === 1) {
            if (openClosed.at(0) === "Open") {
                auctionOpenClosed = 0
            } else {
                auctionOpenClosed = 1
            }
        }
        const sortOrderIndex = sortOrders.indexOf(sortOrder as string)
        updateAuctions(searchBoxText, categoryNames, auctionOpenClosed, sortOrderIndex)
    }

    const clearFilters = async () => {
        await setSearchBoxText("")
        await setCategoryNames([])
        await setOpenClosed([])
        await setSortOrder(sortOrders.at(0))
        updateAuctions()
    }

    const handleCategoryAdd = (event: SelectChangeEvent<typeof categoryNames>) => {
        const {
            target: { value },
        } = event;
        setCategoryNames(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleOpenClosedAdd = (event: SelectChangeEvent<typeof openClosed>) => {
        const {
            target: { value },
        } = event;
        setOpenClosed(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleSortOrderChanged = (event: SelectChangeEvent<typeof sortOrder>) => {
        setSortOrder(event.target.value as string)
    }

    return (
        <AppBar position="static" sx={{background: "white"}}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Grid container>
                        <Grid item xs={2} sx={{ flexGrow: 0, display: 'flex', alignItems: "center", borderRadius: 1}}>
                            <FormControl
                                sx={{m: 1, width: 300 }}
                            >
                                <InputLabel id="open-closed-label">Open Auctions</InputLabel>
                                <Select
                                    multiple
                                    value={openClosed}
                                    onChange={handleOpenClosedAdd}
                                    renderValue={(selected) => selected.join(', ')}
                                    labelId={"open-closed-label"}
                                    MenuProps={{PaperProps: {sx: {maxHeight: 300}}}}
                                >
                                    <MenuItem
                                        value={"Open"}
                                    >
                                        <Checkbox checked={openClosed.indexOf("Open") > -1} />
                                        <ListItemText primary={"Open"}/>
                                    </MenuItem>
                                    <MenuItem
                                        value={"Closed"}
                                    >
                                        <Checkbox checked={openClosed.indexOf("Closed") > -1} />
                                        <ListItemText primary={"Closed"}/>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3} sx={{ flexGrow: 0, display: 'flex', alignItems: "center", borderRadius: 1}}>
                            <FormControl
                                sx={{m: 1, width: 300 }}
                            >
                                <InputLabel id="select-label">Category</InputLabel>
                                <Select
                                    multiple
                                    value={categoryNames}
                                    onChange={handleCategoryAdd}
                                    renderValue={(selected) => selected.join(', ')}
                                    // label="Category"
                                    labelId={"select-label"}
                                    // style={{width: 250, maxHeight: 40}}
                                    MenuProps={{PaperProps: {sx: {maxHeight: 300}}}}
                                >
                                    {categories.map((category: { categoryId: number; name: string; }) => (
                                        <MenuItem
                                            key={category.categoryId}
                                            value={category.name}
                                        >
                                            <Checkbox checked={categoryNames.indexOf(category.name) > -1} />
                                            <ListItemText primary={category.name}/>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4} sx={{ flexGrow: 0, display: 'flex', alignItems: "center", borderRadius: 1}}>
                            <form onSubmit={async (e: { preventDefault: () => void; }) => {
                                await search();
                                e.preventDefault()
                            }}>
                                <TextField
                                    id="search-bar"
                                    className="text"
                                    value={searchBoxText}
                                    onChange={e => {setSearchBoxText(e.target.value)}}
                                    variant="outlined"
                                    placeholder="Search..."
                                    size="small"
                                />
                            </form>
                        </Grid>
                        <Grid item xs={2} sx={{ flexGrow: 0, display: 'flex', alignItems: "center", borderRadius: 1}}>
                            <FormControl
                                sx={{m: 1, width: 300 }}
                            >
                                <InputLabel id="sort-label">Sort Order</InputLabel>
                                <Select
                                    value={sortOrder}
                                    onChange={handleSortOrderChanged}
                                    labelId={"sort-label"}
                                    MenuProps={{PaperProps: {sx: {maxHeight: 300}}}}
                                >
                                    {sortOrders.map((order: string) => (
                                        <MenuItem
                                            value={order}
                                        >
                                            <ListItemText primary={order}/>
                                        </MenuItem>
                                        )
                                    )}

                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3} >
                            <Button type={"button"} variant="contained" sx={{mt: 2, ml: 5}} onClick={clearFilters}>
                                Clear
                            </Button>
                            <Button type={"button"} variant="contained" sx={{mt: 2, ml: 5}} onClick={search}>
                                Search
                            </Button>
                        </Grid>

                    </Grid>
                    <Box sx={{flexGrow: 1, display: "flex", gap: "1rem", justifyContent: 'flex-end'}}>
                        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: "center", borderRadius: 1}} bgcolor="white">

                        </Box>
                    </Box>
                    <Box sx={{flexGrow: 1, display: "flex", gap: "1rem", justifyContent: 'flex-end'}}>
                        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: "center", borderRadius: 1}} bgcolor="white">

                        </Box>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default FilterBar