import { arrbufs } from "../common/index.js";
export const BASE58_DID_PREFIX = "did:key:z";
/**
 * Determines if an ArrayBuffer has a given indeterminate length-prefix.
 */
export const hasPrefix = (prefixedKey, prefix) => {
    return arrbufs.equal(prefix, prefixedKey.slice(0, prefix.byteLength));
};
//# sourceMappingURL=util.js.map