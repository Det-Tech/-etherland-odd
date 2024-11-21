import * as Uint8arrays from "uint8arrays";
import * as Namefilters from "../private/namefilter.js";
export async function namefilter(crypto, { bareFilter, shareKey }) {
    const hashedKey = await crypto.hash.sha256(Uint8arrays.fromString(shareKey, "base64pad"));
    return Namefilters.saturate(crypto, await Namefilters.addToBare(crypto, bareFilter, Namefilters.legacyEncodingMistake(hashedKey, "hex")));
}
//# sourceMappingURL=entry-index.js.map