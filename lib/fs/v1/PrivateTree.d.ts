import * as Crypto from "../../components/crypto/implementation.js";
import * as Depot from "../../components/depot/implementation.js";
import * as Manners from "../../components/manners/implementation.js";
import * as Reference from "../../components/reference/implementation.js";
import BaseTree from "../base/tree.js";
import MMPT from "../protocol/private/mmpt.js";
import PrivateFile from "./PrivateFile.js";
import PrivateHistory from "./PrivateHistory.js";
import { Links, SoftLink, UpdateCallback } from "../types.js";
import { DecryptedNode, PrivateSkeletonInfo, PrivateTreeInfo, PrivateAddResult, PrivateLink } from "../protocol/private/types.js";
import { Segments as Path } from "../../path/index.js";
import { PrivateName, BareNameFilter } from "../protocol/private/namefilter.js";
import { Maybe } from "../../common/index.js";
declare type ConstructorParams = {
    crypto: Crypto.Implementation;
    depot: Depot.Implementation;
    manners: Manners.Implementation;
    reference: Reference.Implementation;
    header: PrivateTreeInfo;
    key: Uint8Array;
    mmpt: MMPT;
};
export default class PrivateTree extends BaseTree {
    crypto: Crypto.Implementation;
    depot: Depot.Implementation;
    manners: Manners.Implementation;
    reference: Reference.Implementation;
    children: {
        [name: string]: PrivateTree | PrivateFile;
    };
    header: PrivateTreeInfo;
    history: PrivateHistory;
    key: Uint8Array;
    mmpt: MMPT;
    constructor({ crypto, depot, manners, reference, mmpt, key, header }: ConstructorParams);
    static instanceOf(obj: unknown): obj is PrivateTree;
    static create(crypto: Crypto.Implementation, depot: Depot.Implementation, manners: Manners.Implementation, reference: Reference.Implementation, mmpt: MMPT, key: Uint8Array, parentNameFilter: Maybe<BareNameFilter>): Promise<PrivateTree>;
    static fromBaseKey(crypto: Crypto.Implementation, depot: Depot.Implementation, manners: Manners.Implementation, reference: Reference.Implementation, mmpt: MMPT, key: Uint8Array): Promise<PrivateTree>;
    static fromBareNameFilter(crypto: Crypto.Implementation, depot: Depot.Implementation, manners: Manners.Implementation, reference: Reference.Implementation, mmpt: MMPT, bareNameFilter: BareNameFilter, key: Uint8Array): Promise<PrivateTree>;
    static fromLatestName(crypto: Crypto.Implementation, depot: Depot.Implementation, manners: Manners.Implementation, reference: Reference.Implementation, mmpt: MMPT, name: PrivateName, key: Uint8Array): Promise<PrivateTree>;
    static fromName(crypto: Crypto.Implementation, depot: Depot.Implementation, manners: Manners.Implementation, reference: Reference.Implementation, mmpt: MMPT, name: PrivateName, key: Uint8Array): Promise<PrivateTree>;
    static fromInfo(crypto: Crypto.Implementation, depot: Depot.Implementation, manners: Manners.Implementation, reference: Reference.Implementation, mmpt: MMPT, key: Uint8Array, info: Maybe<DecryptedNode>): Promise<PrivateTree>;
    createChildTree(name: string, onUpdate: Maybe<UpdateCallback>): Promise<PrivateTree>;
    createOrUpdateChildFile(content: Uint8Array, name: string, onUpdate: Maybe<UpdateCallback>): Promise<PrivateFile>;
    putDetailed(): Promise<PrivateAddResult>;
    updateDirectChild(child: PrivateTree | PrivateFile, name: string, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    removeDirectChild(name: string): this;
    getDirectChild(name: string): Promise<PrivateTree | PrivateFile | null>;
    getName(): Promise<PrivateName>;
    updateParentNameFilter(parentNameFilter: BareNameFilter): Promise<this>;
    get(path: Path): Promise<PrivateTree | PrivateFile | null>;
    getRecurse(nodeInfo: PrivateSkeletonInfo | SoftLink, parts: string[]): Promise<PrivateTree | PrivateFile | null>;
    assignLink({ name, link, skeleton }: {
        name: string;
        link: PrivateLink | SoftLink;
        skeleton: PrivateSkeletonInfo | SoftLink;
    }): void;
    static resolveSoftLink(crypto: Crypto.Implementation, depot: Depot.Implementation, manners: Manners.Implementation, reference: Reference.Implementation, link: SoftLink): Promise<PrivateTree | PrivateFile | null>;
    getLinks(): Links;
    updateLink(name: string, result: PrivateAddResult): this;
    insertSoftLink({ name, key, privateName, username }: {
        name: string;
        key: Uint8Array;
        privateName: PrivateName;
        username: string;
    }): this;
}
export {};
