import { publicKeyToDid } from "./transformers.js";
/**
 * Create a DID based on the exchange key-pair.
 */
export async function exchange(crypto) {
    const pubKey = await crypto.keystore.publicExchangeKey();
    const ksAlg = await crypto.keystore.getAlgorithm();
    return publicKeyToDid(crypto, pubKey, ksAlg);
}
/**
 * Create a DID based on the write key-pair.
 */
export async function write(crypto) {
    const pubKey = await crypto.keystore.publicWriteKey();
    const ksAlg = await crypto.keystore.getAlgorithm();
    return publicKeyToDid(crypto, pubKey, ksAlg);
}
/**
 * Alias `exchange` to `sharing`
 */
export { exchange as sharing };
/**
 * Alias `write` to `agent`
 */
export { write as agent };
/**
 * Alias `write` to `ucan`
 */
export { write as ucan };
//# sourceMappingURL=local.js.map