import create, {StateCreator} from 'zustand'
import {persist, PersistOptions} from "zustand/middleware"
import defaultProfilePicture from "../static/default-profile.jpg"
import {Auction} from "../types/Auction";
import axios from "axios";
import {checkAuctionEnded} from "../helpers/HelperFunctions";
import {numberOfAuctionsPerPage} from "../components/Pages";

type MyStore = {
    loggedIn: boolean,
    login: (userId: number, userToken: string, profilePicture?: string) => void,
    logout: () => void,
    userId: number,
    userToken: string,
    userProfilePicture: string,
    setUserProfilePicture: (newProfilePicture: string) => void,
    auctions: Auction[],
    updateAuctions: (searchQuery?: string, categoryNames?: string[], closedAuctions?: number, sortOrder?: number) => void
    selectedAuction: number,
    categories: Array<{categoryId: number, name: string}>,
    updateCategories: () => void,
    searchQuery: string,
    setSearchQuery: (newSearchQuery: string) => void,
    categoryNames: string[],
    setCategoryNames: (newCategoryNames: string[]) => void,
    openClosed: string[]
    setOpenClosed: (newOpenClosed: string[]) => void,
    sortOrder: string,
    setSortOrder: (newSortOrder: string) => void,
    numberOfAuctions: number,
    currentPage: number,
    setCurrentPage: (newCurrentPage: number) => void,
    auctionsOnPage: number,
    setAuctionsOnPage: (newAuctionsOnPage: number) => void,
}

type MyPersist = (
    config: StateCreator<MyStore>,
    options: PersistOptions<MyStore>
) => StateCreator<MyStore>

export const  useStore = create<MyStore>(
    (persist as unknown as MyPersist)(
        ( set, get) => ({
            loggedIn: false,
            login: async (newUserId: number, newUserToken: string, newProfilePicture: string = defaultProfilePicture) => await set(() => ({
                loggedIn: true,
                userId: newUserId,
                userToken: newUserToken,
                userProfilePicture: newProfilePicture
            })),
            logout: () => set(() => ({loggedIn: false, userId: -1, userToken: ""})),
            userId: -1,
            userToken: "",
            userProfilePicture: defaultProfilePicture,
            setUserProfilePicture: (newProfilePicture: string) => set(() => {
                return {userProfilePicture: newProfilePicture}
            }),
            auctions: [],
            updateAuctions: async (searchQuery: string = "", categoryNames: string[] = [], closedAuctions: number = -1, sortOrder = 0) => {
                let categoryIdList: number[] = []
                for (let categoryName of categoryNames) {
                    for (let category of get().categories) {
                        if (categoryName === category.name) {
                            categoryIdList.push(category.categoryId)
                        }
                    }
                }
                let sortOrderString;
                switch (sortOrder) {
                    case 1: {sortOrderString = "CLOSING_LAST"; break}
                    case 2: {sortOrderString = "ALPHABETICAL_ASC"; break}
                    case 3: {sortOrderString = "ALPHABETICAL_DESC"; break}
                    case 4: {sortOrderString = "BIDS_ASC"; break}
                    case 5: {sortOrderString = "BIDS_DESC"; break}
                    case 6: {sortOrderString = "RESERVE_ASC"; break}
                    case 7: {sortOrderString = "RESERVE_DESC"; break}
                    default: {sortOrderString = "CLOSING_SOON"; break}
                }
                const newAuctions = await axios.get("http://localhost:4941/api/v1/auctions/", {params: {q: searchQuery, categoryIds: categoryIdList, sortBy: sortOrderString}})
                    .then(response => {
                        return response.data.auctions
                    }).catch(() => {
                        return []
                    })

                let foundAuctions: Auction[] = [];
                // Open auctions only
                if (closedAuctions === 0) {
                    for (let auction of newAuctions) {
                        if (!checkAuctionEnded(auction.endDate)) {
                            foundAuctions.push(auction)
                        }
                    }
                // Closed auctions only
                } else if (closedAuctions === 1) {
                    for (let auction of newAuctions) {
                        if (checkAuctionEnded(auction.endDate)) {
                            foundAuctions.push(auction)
                        }
                    }

                } else {
                    foundAuctions = newAuctions
                }
                set(() => ({
                    auctions: foundAuctions,
                    numberOfAuctions: foundAuctions.length,
                    currentPage: 1
                }))
                await get().updateCategories()
            },
            selectedAuction: -1,
            categories: [],
            updateCategories: async () => {
                let newCategories = await axios.get("http://localhost:4941/api/v1/auctions/categories")
                    .then(response => {
                        return response.data
                    }).catch(() => {
                        return []
                    })
                set(() => ({
                    categories: newCategories,
                }))
            },
            searchQuery: "",
            setSearchQuery: (newSearchQuery: string) => set(() =>{
                    return {searchQuery: newSearchQuery}
            }),
            categoryNames: [],
            setCategoryNames: (newCategoryNames: string[]) => set(() => {
                return {categoryNames: newCategoryNames}
            }),
            openClosed: [],
            setOpenClosed: (newOpenClosed: string[]) => set(() => {
                return {openClosed: newOpenClosed}
            }),
            sortOrder: "Closing Date - Asc",
            setSortOrder: (newSortOrder: string) => set(() => {
                return {sortOrder: newSortOrder}
            }),
            numberOfAuctions: 0,
            currentPage: 1,
            setCurrentPage: (newCurrentPage: number) => set(() => {
                return {currentPage: newCurrentPage}
            }),
            auctionsOnPage: numberOfAuctionsPerPage.at(0) as number,
            setAuctionsOnPage: (newAuctionsOnPage: number) => set(() => {
                return {auctionsOnPage: newAuctionsOnPage}
            })

    }),

    {
        name: "auth-storage"
    }
))
