/**
 * Helper to decode a byte array into a string.
 * 
 * @remarks
 * This method is downloaded from Stack Overflow.
 *
 * @param {Uint8Array} array - array to be decoded
 * @return {string} - string decoded from the array.
 */
export const decodeByteArray = (array: Uint8Array): string => {
    let out: string, i: number, len: number, c: keyof Uint8Array;
    let char2: keyof Uint8Array, char3: keyof Uint8Array;

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
                out += String.fromCharCode(
                    ((c & 0x0f) << 12) |
                        ((char2 & 0x3f) << 6) |
                        ((char3 & 0x3f) << 0)
                );
                break;
        }
    }

    return out;
}

/**
 * Helper to convert byte array to JSON objects.
 *
 * @param {Uint8Array} array
 * @return {*} Parsed value
 */
export const decodeAndParse = (array: Uint8Array) => {
    const stringFromUint8Array = decodeByteArray(array);

    return JSON.parse(stringFromUint8Array)
}

/**
 * Helper to convert objects back into byte arrays.
 *
 * @param {object} object
 * @return {Uint8Array} byte array representing the object 
 */
export const objectToByteArray = (object: object) => {
    return Buffer.from(JSON.stringify(object)) as Uint8Array
}

/**
 * Helper to generate ids.
 *
 * @return {string} - generated id
 */
export const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
