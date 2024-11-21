import type { CID } from "multiformats/cid";
import * as Depot from "../../components/depot/implementation.js";
import { HardLinks, BaseLinks, Tree, File, Puttable, UpdateCallback } from "../types.js";
import { Maybe } from "../../common/index.js";
import { Segments as Path } from "../../path/index.js";
import BareFile from "../bare/file.js";
import BaseTree from "../base/tree.js";
declare class BareTree extends BaseTree {
    depot: Depot.Implementation;
    links: HardLinks;
    children: {
        [name: string]: Tree | File;
    };
    type: "BareTree";
    constructor(depot: Depot.Implementation, links: HardLinks);
    static empty(depot: Depot.Implementation): Promise<BareTree>;
    static fromCID(depot: Depot.Implementation, cid: CID): Promise<BareTree>;
    static fromLinks(depot: Depot.Implementation, links: HardLinks): BareTree;
    static instanceOf(obj: unknown): obj is BareTree;
    createChildTree(name: string, onUpdate: Maybe<UpdateCallback>): Promise<Tree>;
    createOrUpdateChildFile(content: Uint8Array, name: string, onUpdate: Maybe<UpdateCallback>): Promise<BareFile>;
    putDetailed(): Promise<Depot.PutResult>;
    putAndUpdateLink(child: Puttable, name: string, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    updateDirectChild(child: Tree | File, name: string, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    removeDirectChild(name: string): this;
    getDirectChild(name: string): Promise<Tree | File | null>;
    get(path: Path): Promise<Tree | File | null>;
    updateLink(name: string, result: Depot.PutResult): this;
    getLinks(): BaseLinks;
}
export default BareTree;
