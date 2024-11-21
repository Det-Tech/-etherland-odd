import * as Uint8arrays from "uint8arrays";
/**
 * Creates a share key.
 */
export async function create(crypto, { counter, recipientExchangeDid, senderRootDid }) {
    const bytes = Uint8arrays.fromString(`${recipientExchangeDid}${senderRootDid}${counter}`, "utf8");
    return Uint8arrays.toString(await crypto.hash.sha256(bytes), "base64pad");
}
/**
 * Creates the payload for a share key.
 */
export function payload({ entryIndexCid, symmKey, symmKeyAlgo }) {
    const cid = entryIndexCid;
    return {
        algo: symmKeyAlgo,
        key: typeof symmKey === "string"
            ? Uint8arrays.fromString(symmKey, "base64pad")
            : symmKey,
        cid
    };
}
//# sourceMappingURL=key.js.map