import * as Path from "./path/index.js";
import { AppInfo } from "./appInfo.js";
import { Distinctive } from "./path/index.js";
import { Potency, Resource } from "./ucan/index.js";
export declare const ROOT_FILESYSTEM_PERMISSIONS: {
    fs: {
        private: Path.DirectoryPath<Path.Segments>[];
        public: Path.DirectoryPath<Path.Segments>[];
    };
};
export declare type Permissions = {
    app?: AppInfo;
    fs?: FileSystemPermissions;
    platform?: PlatformPermissions;
    raw?: RawPermissions;
    sharing?: boolean;
};
export declare type FileSystemPermissions = {
    private?: Array<Distinctive<Path.Segments>>;
    public?: Array<Distinctive<Path.Segments>>;
};
export declare type PlatformPermissions = {
    apps: "*" | Array<string>;
};
export declare type RawPermissions = Array<RawPermission>;
export declare type RawPermission = {
    exp: number;
    rsc: Resource;
    ptc: Potency;
};
/**
 * App identifier.
 */
export declare function appId(app: AppInfo): string;
/**
 * Lists the filesystems paths for a set of `Permissions`.
 * This'll return a list of `DistinctivePath`s.
 */
export declare function permissionPaths(permissions: Permissions): Distinctive<Path.Partitioned<Path.Partition>>[];
