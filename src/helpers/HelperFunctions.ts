import axios from "axios";
import {Auction} from "../types/Auction";

export const emailRegex = "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Za-z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\\b$"
export const acceptedImageFileTypes = ["image/jpg", "image/jpeg", "image/png", "image/gif"]

const calculateTimezoneOffsetInHoursAndMinutes = (date: Date) => {
    const offsetMinutes = date.getTimezoneOffset() * -1

    const hours = (offsetMinutes / 60)
    const roundedHours = Math.floor(hours)
    const minutes = (hours - roundedHours) * 60
    const roundedMinutes = Math.round(minutes)
    let stringHours = roundedHours.toString()
    let stringMinutes = roundedMinutes.toString()
    let sign;
    if (stringHours.length === 1) {
        stringHours = "0" + stringHours
    }
    if (stringMinutes.length === 1) {
        stringMinutes = "0" + stringMinutes
    }
    if (offsetMinutes > 0) {
        sign = "+"
    } else {
        sign = "-"
    }

    return `${sign}${stringHours}:${stringMinutes}`


}

export const calculateClosingTime = (today: Date, auctionEndDateString: string) : string => {
    let closed;
    let yearDiff;
    let monthDiff;
    let dayDiff;
    const timezoneOffset = calculateTimezoneOffsetInHoursAndMinutes(today);
    auctionEndDateString = auctionEndDateString.slice(0,-1) + timezoneOffset;

    [closed, yearDiff, monthDiff, dayDiff] = dateDiff(today.toDateString(), auctionEndDateString)


    if (monthDiff === 0 && yearDiff === 0 && (dayDiff === 1 || dayDiff === 0)) {
        if (dayDiff === 1) {
            if (closed) {
                return "Closed yesterday"
            }
            return "Closes tomorrow"
        } else {
            if (compareDateHours(today.toISOString(), auctionEndDateString)) {
                return "Closed today"
            }
            return "Closes today"
        }
    }

    let times = ["Closes in"]
    if (closed) {
        times = ["Closed"]
    }
    if (yearDiff > 0) {
        if (yearDiff === 1) {
            times.push(`${yearDiff} year`)
        } else {
            times.push(`${yearDiff} years`)
        }
    }
    if (monthDiff > 0) {
        if (monthDiff === 1) {
            times.push(`${monthDiff} month`)
        } else {
            times.push(`${monthDiff} months`)
        }
    }
    if (dayDiff > 0) {
        if (dayDiff === 1) {
            times.push(`${dayDiff} day`)
        } else {
            times.push(`${dayDiff} days`)
        }
    }

    let timeString;
    if (times.length === 2) {
        timeString =  times.join(" ")
    } else if (times.length === 3) {
        timeString =  `${times[0]} ${times[1]} and ${times[2]}`
    } else {
        timeString =  `${times[0]} ${times[1]}, ${times[2]} and ${times[3]}`
    }

    if (closed) {
        return timeString + " ago"
    } else {
        return timeString
    }
}

const dateDiff = (startingDate: string, endingDate: string) => {
    let closed = false;
    let startDate = new Date(new Date(startingDate).toISOString().slice(0, 10));
    if (!endingDate) {
        endingDate = new Date().toISOString().slice(0, 10); // need date in YYYY-MM-DD format
    }
    let endDate = new Date(endingDate);
    if (startDate > endDate) {
        closed = true;
        const swap = startDate;
        startDate = endDate;
        endDate = swap;
    }
    const startYear = startDate.getUTCFullYear();
    const february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
    const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let yearDiff = endDate.getUTCFullYear() - startYear;
    let monthDiff = endDate.getUTCMonth() - startDate.getUTCMonth();
    if (monthDiff < 0) {
        yearDiff--;
        monthDiff += 12;
    }
    let dayDiff = endDate.getUTCDate() - startDate.getUTCDate();
    if (dayDiff < 0) {
        if (monthDiff > 0) {
            monthDiff--;
        } else {
            yearDiff--;
            monthDiff = 11;
        }
        dayDiff += daysInMonth[startDate.getUTCMonth()];
    }

    return [closed, yearDiff, monthDiff, dayDiff]
}

export const getPrettyDateString = (date: string) => {
    return (new Date(date)).toLocaleString()
}

const compareDateHours = (startDate: string, endDate: string) => {
    startDate = startDate.slice(11, 19)
    endDate = endDate.slice(11, 19)
    return (startDate > endDate)
}

export const checkAuctionEnded = (endDate: string) => {
    return (new Date(Date.now())).toISOString() > endDate
}

export const getAuctions = async () => {
    return await axios.get("http://localhost:4941/api/v1/auctions/")
        .then(response => {
            return response.data.auctions
        }).catch(() => {
            return []
        })
}

export const getAuctionBids = async (auctionId: string) => {
    return await axios.get(`http://localhost:4941/api/v1/auctions/${auctionId}/bids`)
        .then(response => {
            return response.data
        }).catch(() => {
            return []
        })
}


export const getUsersAuctions = async (userId: number) => {
    const auctions = await getAuctions()
    const usersAuctions: Auction[] = []

    for (let auction of auctions) {
        if (auction.sellerId === userId) {
            usersAuctions.push(auction)
        }
    }

    return usersAuctions

}

export const getAuctionsUserBiddedOn = async (userId: number) => {
    const auctions = await getAuctions()
    const auctionsUserBiddedOn: Auction[] = []
    let auctionBids

    for (let auction of auctions) {
        if (auction.sellerId !== userId) {
            auctionBids = await getAuctionBids(auction.auctionId.toString())
            for (let bid of auctionBids) {
                if (bid.bidderId === userId) {
                    auctionsUserBiddedOn.push(auction)
                    break
                }
            }
        }
    }
    return auctionsUserBiddedOn
}

export const getCategoryName = (categoryId: number, categories: any) => {
    for (let category of categories) {
        if (categoryId === category.categoryId) {
            return category.name
        }
    }
}

export const getCategoryId = (categoryName: string, categories: any) => {
    for (let category of categories) {
        if (categoryName === category.name) {
            return category.categoryId
        }
    }
}

export const isEmptyOrSpaces = (str: string) => {
    return str === null || str.match(/^\s*$/) !== null;
}

export const convertDateStringForInput = (date: Date) => {
    var tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -8);

}