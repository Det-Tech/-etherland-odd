import * as Crypto from "../components/crypto/implementation.js";
/**
 * Convert a base64 public key to a DID (did:key).
 */
export declare function publicKeyToDid(crypto: Crypto.Implementation, publicKey: Uint8Array, keyType: string): string;
/**
 * Convert a DID (did:key) to a base64 public key.
 */
export declare function didToPublicKey(crypto: Crypto.Implementation, did: string): {
    publicKey: Uint8Array;
    type: string;
};
