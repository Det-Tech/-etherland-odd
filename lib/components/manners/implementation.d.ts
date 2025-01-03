import { CID } from "multiformats";
import type { Configuration } from "../../configuration.js";
import * as Crypto from "../../components/crypto/implementation.js";
import * as Depot from "../../components/depot/implementation.js";
import * as Reference from "../../components/reference/implementation.js";
import * as Storage from "../../components/storage/implementation.js";
import * as FileSystem from "../../fs/types.js";
export declare type ImplementationOptions = {
    configuration: Configuration;
};
export declare type DataComponents = {
    crypto: Crypto.Implementation;
    depot: Depot.Implementation;
    reference: Reference.Implementation;
    storage: Storage.Implementation;
};
export declare type Implementation = {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    /**
     * Configure how the wnfs wasm module should be loaded.
     *
     * This only has an effect if you're using file systems of version 3 or higher.
     *
     * By default this loads the required version of the wasm wnfs module from unpkg.com.
     */
    wnfsWasmLookup: (wnfsVersion: string) => Promise<BufferSource | Response>;
    /**
     * File system.
     */
    fileSystem: {
        /**
         * Various file system hooks.
         */
        hooks: {
            afterLoadExisting: (fs: FileSystem.API, account: FileSystem.AssociatedIdentity, dataComponents: DataComponents) => Promise<void>;
            afterLoadNew: (fs: FileSystem.API, account: FileSystem.AssociatedIdentity, dataComponents: DataComponents) => Promise<void>;
            beforeLoadExisting: (cid: CID, account: FileSystem.AssociatedIdentity, dataComponents: DataComponents) => Promise<void>;
            beforeLoadNew: (account: FileSystem.AssociatedIdentity, dataComponents: DataComponents) => Promise<void>;
        };
    };
};
