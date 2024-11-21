import * as Crypto from "../components/crypto/implementation.js";
export declare function exists({ crypto, accountDID }: {
    crypto: Crypto.Implementation;
    accountDID: string;
}): Promise<boolean>;
export declare function retrieve({ crypto, accountDID }: {
    crypto: Crypto.Implementation;
    accountDID: string;
}): Promise<Uint8Array>;
export declare function store({ crypto, accountDID, readKey }: {
    crypto: Crypto.Implementation;
    readKey: Uint8Array;
    accountDID: string;
}): Promise<void>;
export declare function fromString(a: string): Uint8Array;
export declare function toString(a: Uint8Array): string;
