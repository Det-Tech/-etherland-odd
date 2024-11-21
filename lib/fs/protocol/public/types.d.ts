import type { CID } from "multiformats/cid";
import { Metadata } from "../../metadata.js";
import { PutResult } from "../../../components/depot/implementation.js";
import { SoftLink } from "../../types.js";
export declare type PutDetails = PutResult & {
    userland: CID;
    metadata: CID;
    isFile: boolean;
    skeleton: Skeleton;
};
export declare type SkeletonInfo = {
    cid: CID | string;
    userland: CID | string;
    metadata: CID | string;
    subSkeleton: Skeleton;
    isFile: boolean;
};
export declare type Skeleton = {
    [name: string]: SkeletonInfo | SoftLink;
};
export declare type TreeHeader = {
    metadata: Metadata;
    previous?: CID | string;
    skeleton: Skeleton;
};
export declare type TreeInfo = TreeHeader & {
    userland: CID | string;
};
export declare type FileHeader = {
    metadata: Metadata;
    previous?: CID | string;
};
export declare type FileInfo = FileHeader & {
    userland: CID | string;
};
