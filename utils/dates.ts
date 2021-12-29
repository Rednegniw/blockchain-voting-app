
/**
 * Helper to see if the date is before today.
 *
 * @param {string} dateString
 * @return {boolean} 
 */
 export const isDateBeforeToday = (dateString: string) => {
    return new Date(dateString) < new Date(new Date().toDateString());
}

/**
 * Helper to see if the left date is before the other date
 *
 * @param {string} dateString
 * @param {string} dateString2
 * @return {*} 
 */
export const isDateBeforeOtherDate = (dateString: string, dateString2: string) => {
    return new Date(dateString) < new Date(dateString2);
}