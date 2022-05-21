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
    let yearDiff;
    let monthDiff;
    let dayDiff;
    const timezoneOffset = calculateTimezoneOffsetInHoursAndMinutes(today);
    auctionEndDateString = auctionEndDateString.slice(0,-1) + timezoneOffset;

    [yearDiff, monthDiff, dayDiff] = dateDiff(today.toDateString(), auctionEndDateString)
    if (monthDiff === 0 && yearDiff === 0 && (dayDiff === 1 || dayDiff === 0)) {
        if (dayDiff === 1) {
            return "Closes tomorrow"
        } else {
            return "Closes today"
        }
    }

    let times = ["Closes in"]
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

    if (times.length === 2) {
        return times.join(" ")
    } else if (times.length === 3) {
        return `${times[0]} ${times[1]} and ${times[2]}`
    } else {
        return `${times[0]} ${times[1]}, ${times[2]} and ${times[3]}`
    }


}

export const dateDiff = (startingDate: string, endingDate: string) => {
    let startDate = new Date(new Date(startingDate).toISOString().slice(0, 10));
    if (!endingDate) {
        endingDate = new Date().toISOString().slice(0, 10); // need date in YYYY-MM-DD format
    }
    let endDate = new Date(endingDate);
    if (startDate > endDate) {
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

    return [yearDiff, monthDiff, dayDiff]
}