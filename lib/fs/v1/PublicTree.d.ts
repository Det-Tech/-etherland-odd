import { CID } from "multiformats/cid";
import * as Depot from "../../components/depot/implementation.js";
import * as Path from "../../path/index.js";
import * as Reference from "../../components/reference/implementation.js";
import { Link, Links, NonEmptyPath, SoftLink, UpdateCallback } from "../types.js";
import { Maybe } from "../../common/index.js";
import { DistinctivePath } from "../../path/index.js";
import { Skeleton, SkeletonInfo, TreeInfo, TreeHeader, PutDetails } from "../protocol/public/types.js";
import BaseTree from "../base/tree.js";
import BareTree from "../bare/tree.js";
import PublicFile from "./PublicFile.js";
import PublicHistory from "./PublicHistory.js";
declare type ConstructorParams = {
    depot: Depot.Implementation;
    reference: Reference.Implementation;
    cid: Maybe<CID>;
    links: Links;
    header: TreeHeader;
};
declare type Child = PublicFile | PublicTree | BareTree;
export declare class PublicTree extends BaseTree {
    depot: Depot.Implementation;
    reference: Reference.Implementation;
    children: {
        [name: string]: Child;
    };
    cid: Maybe<CID>;
    links: Links;
    header: TreeHeader;
    history: PublicHistory;
    constructor({ depot, reference, links, header, cid }: ConstructorParams);
    static empty(depot: Depot.Implementation, reference: Reference.Implementation): Promise<PublicTree>;
    static fromCID(depot: Depot.Implementation, reference: Reference.Implementation, cid: CID): Promise<PublicTree>;
    static fromInfo(depot: Depot.Implementation, reference: Reference.Implementation, info: TreeInfo, cid: CID): Promise<PublicTree>;
    static instanceOf(obj: unknown): obj is PublicTree;
    createChildTree(name: string, onUpdate: Maybe<UpdateCallback>): Promise<PublicTree>;
    createOrUpdateChildFile(content: Uint8Array, name: string, onUpdate: Maybe<UpdateCallback>): Promise<PublicFile>;
    putDetailed(): Promise<PutDetails>;
    updateDirectChild(child: PublicTree | PublicFile, name: string, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    removeDirectChild(name: string): this;
    getDirectChild(name: string): Promise<Child | null>;
    get(path: Path.Segments): Promise<Child | null>;
    getRecurse(skel: Skeleton, path: NonEmptyPath): Promise<SkeletonInfo | Child | null>;
    assignLink({ name, link, skeleton }: {
        name: string;
        link: Link;
        skeleton: SkeletonInfo | SoftLink;
    }): void;
    static resolveSoftLink(depot: Depot.Implementation, reference: Reference.Implementation, link: SoftLink): Promise<Child | null>;
    getLinks(): Links;
    updateLink(name: string, result: PutDetails): this;
    insertSoftLink({ name, path, username }: {
        name: string;
        path: DistinctivePath<Path.Segments>;
        username: string;
    }): this;
}
export default PublicTree;
