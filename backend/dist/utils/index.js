"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = exports.isDateBeforeOtherDate = exports.isDateBeforeToday = exports.objectToByteArray = exports.decodeAndParse = void 0;
/**
 * Helper to decode a byte array into a string.
 *
 * @remarks
 * This method is downloaded from Stack Overflow.
 *
 * @param {Uint8Array} array - array to be decoded
 * @return {string} - string decoded from the array.
 */
const decodeByteArray = (array) => {
    let out, i, len, c;
    let char2, char3;
    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
                break;
            case 14:
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0f) << 12) |
                    ((char2 & 0x3f) << 6) |
                    ((char3 & 0x3f) << 0));
                break;
        }
    }
    return out;
};
/**
 * Helper to convert byte array to JSON objects.
 *
 * @param {Uint8Array} array
 * @return {*} Parsed value
 */
const decodeAndParse = (array) => {
    const stringFromUint8Array = decodeByteArray(array);
    return JSON.parse(stringFromUint8Array);
};
exports.decodeAndParse = decodeAndParse;
/**
 * Helper to convert objects back into byte arrays.
 *
 * @param {object} object
 * @return {Uint8Array} byte array representing the object
 */
const objectToByteArray = (object) => {
    return Buffer.from(JSON.stringify(object));
};
exports.objectToByteArray = objectToByteArray;
/**
 * Helper to see if the date is before today.
 *
 * @param {string} dateString
 * @return {boolean}
 */
const isDateBeforeToday = (dateString) => {
    return new Date(dateString) < new Date(new Date().toDateString());
};
exports.isDateBeforeToday = isDateBeforeToday;
/**
 * Helper to see if the left date is before the other date
 *
 * @param {string} dateString
 * @param {string} dateString2
 * @return {*}
 */
const isDateBeforeOtherDate = (dateString, dateString2) => {
    return new Date(dateString) < new Date(dateString2);
};
exports.isDateBeforeOtherDate = isDateBeforeOtherDate;
/**
 * Helper to generate ids.
 *
 * @return {string} - generated id
 */
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
exports.generateId = generateId;
