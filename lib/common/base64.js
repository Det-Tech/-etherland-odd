import * as uint8arrays from "uint8arrays";
export function decode(base64) {
    return uint8arrays.toString(uint8arrays.fromString(base64, "base64pad"));
}
export function encode(str) {
    return uint8arrays.toString(uint8arrays.fromString(str), "base64pad");
}
export function urlDecode(base64) {
    return decode(makeUrlUnsafe(base64));
}
export function urlEncode(str) {
    return makeUrlSafe(encode(str));
}
export function makeUrlSafe(a) {
    return a.replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "");
}
export function makeUrlUnsafe(a) {
    return a.replace(/_/g, "/").replace(/-/g, "+");
}
//# sourceMappingURL=base64.js.map