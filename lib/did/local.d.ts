import * as Crypto from "../components/crypto/implementation.js";
/**
 * Create a DID based on the exchange key-pair.
 */
export declare function exchange(crypto: Crypto.Implementation): Promise<string>;
/**
 * Create a DID based on the write key-pair.
 */
export declare function write(crypto: Crypto.Implementation): Promise<string>;
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
