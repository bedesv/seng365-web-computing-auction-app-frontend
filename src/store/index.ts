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
}

type MyPersist = (
    config: StateCreator<MyStore>,
    options: PersistOptions<MyStore>
) => StateCreator<MyStore>

export const  useStore = create<MyStore>(
    (persist as unknown as MyPersist)(
        ( set) => ({
    loggedIn: false,
    login: async (newUserId: number, newUserToken: string, newProfilePicture: string = defaultProfilePicture) => await set(() => ({
        loggedIn: true,
        userId: newUserId,
        userToken: newUserToken,
        userProfilePicture: newProfilePicture
    })),
    logout: () => set((state) => ({loggedIn: false, userId: -1, userToken: ""})),
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
            auctions: newAuctions
        }))
    },
    searchQuery: ""
    }),
    {
        name: "auth-storage"
    }
))
