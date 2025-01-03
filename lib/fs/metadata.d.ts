import * as versions from "./versions.js";
export declare type UnixFileMode = number;
export declare enum UnixNodeType {
    Raw = "raw",
    Directory = "dir",
    File = "file",
    Metadata = "metadata",
    Symlink = "symlink",
    HAMTShard = "hamtShard"
}
export declare type UnixMeta = {
    mtime: number;
    ctime: number;
    mode: UnixFileMode;
    _type: string;
};
export declare type Metadata = {
    unixMeta: UnixMeta;
    isFile: boolean;
    version: versions.SemVer;
};
export declare const emptyUnix: (isFile: boolean) => UnixMeta;
export declare const empty: (isFile: boolean, version: versions.SemVer) => Metadata;
export declare const updateMtime: (metadata: Metadata) => Metadata;
