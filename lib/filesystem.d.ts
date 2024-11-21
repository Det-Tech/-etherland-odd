import { CID } from "multiformats/cid";
import * as Crypto from "./components/crypto/implementation.js";
import * as Depot from "./components/depot/implementation.js";
import * as Events from "./events.js";
import * as Reference from "./components/reference/implementation.js";
import * as Storage from "./components/storage/implementation.js";
import { AuthenticationStrategy } from "./index.js";
import { Configuration } from "./configuration.js";
import { Dependencies } from "./fs/filesystem.js";
import { type RecoverFileSystemParams } from "./fs/types/params.js";
import FileSystem from "./fs/filesystem.js";
/**
 * Load a user's file system.
 */
export declare function loadFileSystem({ config, dependencies, eventEmitter, rootKey, username }: {
    config: Configuration;
    dependencies: Dependencies;
    eventEmitter: Events.Emitter<Events.FileSystem>;
    rootKey?: Uint8Array;
    username: string;
}): Promise<FileSystem>;
/**
 * Recover a user's file system.
 */
export declare function recoverFileSystem({ auth, dependencies, oldUsername, newUsername, readKey, }: {
    auth: AuthenticationStrategy;
    dependencies: {
        crypto: Crypto.Implementation;
        reference: Reference.Implementation;
        storage: Storage.Implementation;
    };
} & RecoverFileSystemParams): Promise<{
    success: boolean;
}>;
export declare function checkFileSystemVersion(depot: Depot.Implementation, config: Configuration, filesystemCID: CID): Promise<void>;
