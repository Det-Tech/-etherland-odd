import type { CID } from "multiformats/cid";
import { BareNameFilter, PrivateName } from "./namefilter.js";
import { BaseLink, SoftLink } from "../../types.js";
import { Metadata } from "../../metadata.js";
import { PutResult } from "../../../components/depot/implementation.js";
export declare type DecryptedNode = PrivateFileInfo | PrivateTreeInfo;
export declare type PrivateFileInfo = {
    content: string;
    metadata: Metadata;
    bareNameFilter: BareNameFilter;
    revision: number;
    key: string;
};
export declare type PrivateLink = BaseLink & {
    key: string;
    pointer: PrivateName;
};
export declare type PrivateLinks = {
    [name: string]: PrivateLink | SoftLink;
};
export declare type PrivateTreeInfo = {
    metadata: Metadata;
    bareNameFilter: BareNameFilter;
    revision: number;
    links: PrivateLinks;
    skeleton: PrivateSkeleton;
};
export declare type PrivateSkeleton = {
    [name: string]: PrivateSkeletonInfo | SoftLink;
};
export declare type PrivateSkeletonInfo = {
    cid: string;
    key: string;
    subSkeleton: PrivateSkeleton;
};
export declare type PrivateAddResult = PutResult & {
    name: PrivateName;
    key: Uint8Array;
    skeleton: PrivateSkeleton;
};
export declare type Revision = {
    cid: CID | string;
    name: PrivateName;
    number: number;
};
