import * as Crypto from "../../../components/crypto/implementation.js";
import { Opaque } from "../../../common/types.js";
export declare type ShareKey = Opaque<"ShareKey", string>;
/**
 * Creates a share key.
 */
export declare function create(crypto: Crypto.Implementation, { counter, recipientExchangeDid, senderRootDid }: {
    counter: number;
    recipientExchangeDid: string;
    senderRootDid: string;
}): Promise<string>;
/**
 * Creates the payload for a share key.
 */
export declare function payload({ entryIndexCid, symmKey, symmKeyAlgo }: {
    entryIndexCid: string;
    symmKey: string | Uint8Array;
    symmKeyAlgo: string;
}): {
    algo: string;
    key: Uint8Array;
    cid: string;
};
