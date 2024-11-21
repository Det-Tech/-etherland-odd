import * as Crypto from "../components/crypto/implementation.js";
import * as FileSystem from "../fs/types.js";
/**
 * Adds some sample to the file system.
 */
export declare function addSampleData(fs: FileSystem.API): Promise<void>;
/**
 * Stores the public part of the exchange key in the DID format,
 * in the `/public/.well-known/exchange/DID_GOES_HERE/` directory.
 */
export declare function addPublicExchangeKey(crypto: Crypto.Implementation, fs: FileSystem.API): Promise<void>;
/**
 * Checks if the public exchange key was added in the well-known location.
 * See `addPublicExchangeKey()` for the exact details.
 */
export declare function hasPublicExchangeKey(crypto: Crypto.Implementation, fs: FileSystem.API): Promise<boolean>;
