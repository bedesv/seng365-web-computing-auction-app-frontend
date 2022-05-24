import {
    FormControl,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    Pagination,
    Select,
    SelectChangeEvent,
    Stack
} from "@mui/material";
import React from "react";
import {useStore} from "../store";

export const numberOfAuctionsPerPage = [6, 12, 24, 36, 48]

const Pages = () => {

    const numberOfAuctions = useStore(state => state.numberOfAuctions)
    const setAuctionsOnPage = useStore(state => state.setAuctionsOnPage)
    const setCurrentPage = useStore(state => state.setCurrentPage)
    const auctionsOnPage = useStore(state => state.auctionsOnPage)
    const currentPage = useStore(state => state.currentPage)
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value)
    }

    const handleAuctionsOnPageChanged = (event: SelectChangeEvent<typeof auctionsOnPage>) => {
        setAuctionsOnPage(event.target.value as number)
        setCurrentPage(1)
    }

    return (
        <Grid container>
            <Grid item xs={7} sx={{display: "flex"}} justifyContent={"flex-end"}>
                <Stack spacing={2} sx={{pt: 3, pb: 5}} >
                    <Pagination count={Math.ceil(numberOfAuctions / auctionsOnPage)} page={currentPage} onChange={handlePageChange} />
                </Stack>
            </Grid>
            <Grid item xs={2} sx={{display: "flex"}} justifyContent={"flex-start"}>
                <FormControl
                    sx={{m: 1, width: 300 }}
                >
                    <InputLabel id="auctions-per-page-label">Auctions Per Page</InputLabel>
                    <Select
                        value={auctionsOnPage}
                        onChange={handleAuctionsOnPageChanged}
                        labelId={"auctions-per-page-label"}
                        MenuProps={{PaperProps: {sx: {maxHeight: 300}}}}
                    >
                        {numberOfAuctionsPerPage.map((auctionsPerPage: number) => (
                            <MenuItem
                                value={auctionsPerPage}
                                key={auctionsPerPage}
                            >
                                <ListItemText primary={auctionsPerPage}/>
                            </MenuItem>
                        ))}


                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={2} sx={{display: "flex"}} justifyContent={"flex-end"}>
            </Grid>
        </Grid>

    )

}
export default Pages
