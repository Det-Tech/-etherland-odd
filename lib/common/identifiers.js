import * as Uint8Arrays from "uint8arrays";
import * as Path from "../path/index.js";
export async function bareNameFilter({ crypto, accountDID, path }) {
    return `wnfs:${accountDID}:bareNameFilter:${await pathHash(crypto, path)}`;
}
export async function readKey({ crypto, accountDID, path }) {
    return `wnfs:${accountDID}:readKey:${await pathHash(crypto, path)}`;
}
// 🛠
async function pathHash(crypto, path) {
    return Uint8Arrays.toString(await crypto.hash.sha256(Uint8Arrays.fromString("/" + Path.unwrap(path).join("/"), "utf8")), "base64pad");
}
//# sourceMappingURL=identifiers.js.map