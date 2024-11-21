/**
 * Filesystem UCANs, read keys and namefilters,
 * attained from elsewhere in confidence.
 */
import * as Crypto from "./components/crypto/implementation.js";
import * as Path from "./path/index.js";
import * as Permissions from "./permissions.js";
import * as Reference from "./components/reference/implementation.js";
import * as Storage from "./components/storage/implementation.js";
import * as Ucan from "./ucan/index.js";
import Repository from "./repository.js";
import { Maybe } from "./common/types.js";
export declare type Capabilities = {
    fileSystemSecrets: FileSystemSecret[];
    ucans: Ucan.Ucan[];
    username: string;
};
export declare type FileSystemSecret = {
    bareNameFilter: string;
    path: Path.Distinctive<Path.Segments>;
    readKey: Uint8Array;
};
export declare const SESSION_TYPE = "capabilities";
export declare function collect({ capabilities, crypto, reference, storage }: {
    capabilities: Capabilities;
    crypto: Crypto.Implementation;
    reference: Reference.Implementation;
    storage: Storage.Implementation;
}): Promise<void>;
export declare function collectSecret({ accountDID, bareNameFilter, crypto, path, readKey, storage }: {
    accountDID: string;
    bareNameFilter: string;
    crypto: Crypto.Implementation;
    path: Path.DistinctivePath<Path.Segments>;
    readKey: Uint8Array;
    storage: Storage.Implementation;
}): Promise<void>;
export declare function collectPermissions({ reference, ucans }: {
    reference: Reference.Implementation;
    ucans: Ucan.Ucan[];
}): Promise<void>;
/**
 * See if the stored UCANs in a repository
 * conform to the given `Permissions`.
 *
 * This returns the last encountered valid UCAN.
 */
export declare function validatePermissions(repo: Repository<Ucan.Ucan>, { app, fs, raw }: Permissions.Permissions): Maybe<Ucan.Ucan>;
/**
 * Ensure the existence and validity of the read keys and namefilters
 * we need for the filesystem based on the permissions we asked for.
 */
export declare function validateSecrets(crypto: Crypto.Implementation, accountDID: string, permissions: Permissions.Permissions): Promise<boolean>;
