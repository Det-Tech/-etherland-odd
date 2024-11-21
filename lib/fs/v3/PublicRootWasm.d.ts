import { CID } from "multiformats";
import { PublicDirectory, PublicFile } from "wnfs";
import * as Depot from "../../components/depot/implementation.js";
import * as Manners from "../../components/manners/implementation.js";
import { Segments as Path } from "../../path/index.js";
import { UnixTree, Puttable, File, Links, PuttableUnixTree } from "../types.js";
import { BlockStore } from "./DepotBlockStore.js";
import { BaseFile } from "../base/file.js";
import { Metadata } from "../metadata.js";
declare type Dependencies = {
    depot: Depot.Implementation;
    manners: Manners.Implementation;
};
export declare class PublicRootWasm implements UnixTree, Puttable {
    dependencies: Dependencies;
    root: Promise<PublicDirectory>;
    lastRoot: PublicDirectory;
    store: BlockStore;
    readOnly: boolean;
    constructor(dependencies: Dependencies, root: PublicDirectory, store: BlockStore, readOnly: boolean);
    static empty(dependencies: Dependencies): Promise<PublicRootWasm>;
    static fromCID(dependencies: Dependencies, cid: CID): Promise<PublicRootWasm>;
    private atomically;
    private withError;
    ls(path: Path): Promise<Links>;
    mkdir(path: Path): Promise<this>;
    cat(path: Path): Promise<Uint8Array>;
    add(path: Path, content: Uint8Array): Promise<this>;
    rm(path: Path): Promise<this>;
    mv(from: Path, to: Path): Promise<this>;
    get(path: Path): Promise<PuttableUnixTree | File | null>;
    exists(path: Path): Promise<boolean>;
    historyStep(): Promise<PublicDirectory>;
    put(): Promise<CID>;
    putDetailed(): Promise<Depot.PutResult>;
}
export declare class PublicDirectoryWasm implements UnixTree, Puttable {
    readOnly: boolean;
    private directory;
    private publicRoot;
    private cachedDir;
    constructor(readOnly: boolean, directory: string[], publicRoot: PublicRootWasm, cachedDir: PublicDirectory);
    private checkMutability;
    private updateCache;
    get header(): {
        metadata: Metadata;
        previous?: CID;
    };
    ls(path: Path): Promise<Links>;
    mkdir(path: Path): Promise<this>;
    cat(path: Path): Promise<Uint8Array>;
    add(path: Path, content: Uint8Array): Promise<this>;
    rm(path: Path): Promise<this>;
    mv(from: Path, to: Path): Promise<this>;
    get(path: Path): Promise<PuttableUnixTree | File | null>;
    exists(path: Path): Promise<boolean>;
    put(): Promise<CID>;
    putDetailed(): Promise<Depot.PutResult>;
}
export declare class PublicFileWasm extends BaseFile {
    private directory;
    private filename;
    private publicRoot;
    private cachedFile;
    constructor(content: Uint8Array, directory: string[], filename: string, publicRoot: PublicRootWasm, cachedFile: PublicFile);
    private updateCache;
    get header(): {
        metadata: Metadata;
        previous?: CID;
    };
    updateContent(content: Uint8Array): Promise<this>;
    putDetailed(): Promise<Depot.PutResult>;
}
export {};
