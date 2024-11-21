import { CID } from "multiformats/cid";
export { CID };
/**
 * CID representing an empty string. We use this to speed up DNS propagation
 * However, we treat that as a null value in the code
 */
export declare const EMPTY_CID = "Qmc5m94Gu7z62RC8waSKkZUrCCBJPyHbkpmGzEePxy2oXJ";
/**
 * Decode a possibly string-encoded CID.
 * Passing an already decoded CID instance works too.
 * @throws Throws an error if a CID cannot be decoded!
 */
export declare function decodeCID(val: CID | object | string): CID;
/**
 * Encode a CID as a string.
 */
export declare function encodeCID(cid: CID | string): string;
