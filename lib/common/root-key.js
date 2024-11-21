import * as Uint8arrays from "uint8arrays";
import * as Identifiers from "./identifiers.js";
import * as Path from "../path/index.js";
// STORAGE
export async function exists({ crypto, accountDID }) {
    const rootKeyId = await identifier(crypto, accountDID);
    return crypto.keystore.keyExists(rootKeyId);
}
export async function retrieve({ crypto, accountDID }) {
    const rootKeyId = await identifier(crypto, accountDID);
    return crypto.keystore.exportSymmKey(rootKeyId);
}
export async function store({ crypto, accountDID, readKey }) {
    const rootKeyId = await identifier(crypto, accountDID);
    return crypto.keystore.importSymmKey(readKey, rootKeyId);
}
// ENCODING
export function fromString(a) {
    return Uint8arrays.fromString(a, "base64pad");
}
export function toString(a) {
    return Uint8arrays.toString(a, "base64pad");
}
// ㊙️
function identifier(crypto, accountDID) {
    const path = Path.directory(Path.RootBranch.Private);
    return Identifiers.readKey({ crypto, path, accountDID });
}
//# sourceMappingURL=root-key.js.map