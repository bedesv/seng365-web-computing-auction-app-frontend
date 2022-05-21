import create, {StateCreator} from 'zustand'
import {persist, PersistOptions} from "zustand/middleware"
import defaultProfilePicture from "../static/default-profile.jpg"
import {Auction} from "../types/Auction";
import axios from "axios";

type MyStore = {
    loggedIn: boolean,
    login: (userId: number, userToken: string, profilePicture?: string) => void,
    logout: () => void,
    userId: number,
    userToken: string,
    userProfilePicture: string,
    auctions: Auction[],
    updateAuctions: (searchQuery: string) => void,
    searchQuery: string,
    selectedAuction: number,
    categories: Array<{categoryId: number, name: string}>,
    updateCategories: () => void,
    updateAuctionCategoryNames: () => void
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
        auctions: [],
        updateAuctions: async (searchQuery: string) => {
            const newAuctions = await axios.get("http://localhost:4941/api/v1/auctions/", {params: {q: searchQuery}})
                .then(response => {
                    return response.data.auctions
                }).catch(err => {
                    return []
                })
            set(() => ({
                auctions: newAuctions,
                searchQuery: searchQuery
            }))
            await get().updateCategories()
        },
        searchQuery: "",
        selectedAuction: -1,
        categories: [],
        updateCategories: async () => {
            let newCategories = await axios.get("http://localhost:4941/api/v1/auctions/categories")
                .then(response => {
                    return response.data
                }).catch(err => {
                    return []
                })
            set(() => ({
                categories: newCategories,
            }))
            get().updateAuctionCategoryNames()
        },
        updateAuctionCategoryNames: () => set((state) => {
            let updatedAuctions = state.auctions
            for (let auction of updatedAuctions) {
                for (let category of state.categories) {
                    if (auction.categoryId === category.categoryId) {
                        auction.categoryName = category.name
                    }
                }
            }
            return {auctions: updatedAuctions}
        })
    }),

    {
        name: "auth-storage"
    }
))
