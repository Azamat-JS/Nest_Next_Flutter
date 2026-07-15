// Intl.DateTimeFormat's weekday/month names are unreliable for "uz" across
// browsers (Chromium's bundled ICU has no uz-Latn data and silently falls
// back to a broken "M07 15, Wed" pattern), so lesson dates are formatted
// from translated day/month keys instead of the Intl API.
export const formatShortWeekdayDate = (
    date: Date,
    t: (key: any) => string,
    { utc = false }: { utc?: boolean } = {},
) => {
    const day = utc ? date.getUTCDate() : date.getDate()
    const month = (utc ? date.getUTCMonth() : date.getMonth()) + 1
    const weekday = utc ? date.getUTCDay() : date.getDay()
    const isoWeekday = weekday === 0 ? 7 : weekday
    return `${t(`daysShort.${isoWeekday}`)}, ${day} ${t(`monthsShort.${month}`)}`
}
