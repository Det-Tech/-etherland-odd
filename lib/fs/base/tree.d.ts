import type { CID } from "multiformats/cid";
import { Maybe } from "../../common/index.js";
import { Segments as Path } from "../../path/index.js";
import { PutResult } from "../../components/depot/implementation.js";
import { Tree, File, UnixTree, Links, UpdateCallback } from "../types.js";
declare abstract class BaseTree implements Tree, UnixTree {
    readOnly: boolean;
    constructor();
    put(): Promise<CID>;
    ls(path: Path): Promise<Links>;
    cat(path: Path): Promise<Uint8Array>;
    mkdir(path: Path): Promise<this>;
    mkdirRecurse(path: Path, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    add(path: Path, content: Uint8Array): Promise<this>;
    addRecurse(path: Path, content: Uint8Array, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    rm(path: Path): Promise<this>;
    rmRecurse(path: Path, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    mv(from: Path, to: Path): Promise<this>;
    exists(path: Path): Promise<boolean>;
    read(path: Path): Promise<Tree | File | null>;
    write(path: Path, content: Uint8Array): Promise<this>;
    getOrCreateDirectChild(name: string, onUpdate: Maybe<UpdateCallback>): Promise<Tree | File>;
    /**
    * `put` is called on child (result of promise) in `updateDirectChild`
    * Then for the outermost parent, `put` should be called manually.
    */
    updateChild(child: Tree | File, path: Path): Promise<this>;
    abstract createChildTree(name: string, onUpdate: Maybe<UpdateCallback>): Promise<Tree>;
    abstract createOrUpdateChildFile(content: Uint8Array, name: string, onUpdate: Maybe<UpdateCallback>): Promise<File>;
    abstract putDetailed(): Promise<PutResult>;
    abstract updateDirectChild(child: Tree | File, name: string, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    abstract removeDirectChild(name: string): this;
    abstract getDirectChild(name: string): Promise<Tree | File | null>;
    abstract get(path: Path): Promise<Tree | File | null>;
    abstract updateLink(name: string, result: PutResult): this;
    abstract getLinks(): Links;
}
export default BaseTree;
