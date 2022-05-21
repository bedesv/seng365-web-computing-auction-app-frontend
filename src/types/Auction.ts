import axios from "axios";

export type Auction = {
    auctionId: number,
    categoryId: number,
    endDate: string,
    highestBid: number,
    numBids: number,
    reserve: number,
    sellerFirstName: string,
    sellerId: number,
    sellerLastName: string,
    title: string,
    categoryName: string

}
