import * as Uint8arrays from "uint8arrays";
import * as Hex from "../../../common/hex.js";
import { BloomFilter } from "fission-bloom-filters";
// CONSTANTS
const FILTER_SIZE = 1024;
const HASH_COUNT = 16;
const SATURATION_THRESHOLD = 320;
// FUNCTIONS
// create bare name filter with a single key
export const createBare = async (crypto, key) => {
    const empty = "0".repeat(FILTER_SIZE / 4);
    return addToBare(crypto, empty, legacyEncodingMistake(key, "base64pad"));
};
// add some string to a name filter
export const addToBare = async (crypto, bareFilter, toAdd) => {
    const filter = fromHex(bareFilter);
    const hash = await crypto.hash.sha256(toAdd);
    filter.add(Uint8arrays.toString(hash, "hex"));
    return (await toHex(filter));
};
// add the revision number to the name filter, salted with the AES key for the node
export const addRevision = async (crypto, bareFilter, key, revision) => {
    const keyStr = Uint8arrays.toString(key, "base64pad");
    const bytes = Uint8arrays.fromString(`${revision}${keyStr}`, "utf8");
    return (await addToBare(crypto, bareFilter, bytes));
};
// saturate the filter to 320 bits and hash it with sha256 to give the private name that a node will be stored in the MMPT with
export const toPrivateName = async (crypto, revisionFilter) => {
    const saturated = await saturateFilter(crypto, fromHex(revisionFilter));
    return toHash(crypto, saturated);
};
// hash a filter with sha256
export const toHash = async (crypto, filter) => {
    const filterBytes = filter.toBytes();
    const hash = await crypto.hash.sha256(filterBytes);
    return (Hex.fromBytes(hash));
};
// saturate a filter (string) to 320 bits
export const saturate = async (crypto, filter, threshold = SATURATION_THRESHOLD) => {
    const saturated = await saturateFilter(crypto, fromHex(filter), threshold);
    return (await toHex(saturated));
};
// saturate a filter to 320 bits
const saturateFilter = async (crypto, filter, threshold = SATURATION_THRESHOLD) => {
    if (threshold > filter.toBytes().byteLength * 8) {
        throw new Error("threshold is bigger than filter size");
    }
    const bits = countOnes(filter);
    if (bits >= threshold) {
        return filter;
    }
    // add hash of filter to saturate
    // theres a chance that the hash will collide with the existing filter and this gets stuck in an infinite loop
    // in that case keep re-hashing the hash & adding to the filter until there is no collision
    const before = filter.toBytes();
    let toHash = before;
    do {
        const hash = await crypto.hash.sha256(toHash);
        filter.add(Hex.fromBytes(hash));
        toHash = hash;
    } while (bufEquals(before, filter.toBytes()));
    return saturateFilter(crypto, filter, threshold);
};
// count the number of 1 bits in a filter
const countOnes = (filter) => {
    const arr = new Uint32Array(filter.toBytes());
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
        count += bitCount32(arr[i]);
    }
    return count;
};
// convert a filter to hex
export const toHex = (filter) => {
    return Hex.fromBytes(filter.toBytes());
};
// convert hex to a BloomFilter object
export const fromHex = (string) => {
    const buf = Hex.toBytes(string);
    return BloomFilter.fromBytes(buf, HASH_COUNT);
};
const bufEquals = (buf1, buf2) => {
    if (buf1.byteLength !== buf2.byteLength)
        return false;
    const arr1 = new Uint8Array(buf1);
    const arr2 = new Uint8Array(buf2);
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
};
// counts the number of 1s in a uint32
// from: https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
const bitCount32 = (num) => {
    const a = num - ((num >> 1) & 0x55555555);
    const b = (a & 0x33333333) + ((a >> 2) & 0x33333333);
    return ((b + (b >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
};
// 🛠
export function legacyEncodingMistake(input, inputEncoding) {
    return Uint8arrays.fromString(Uint8arrays.toString(input, inputEncoding), "utf8");
}
//# sourceMappingURL=namefilter.js.map