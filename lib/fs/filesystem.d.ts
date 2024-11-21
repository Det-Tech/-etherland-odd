import { CID } from "multiformats/cid";
import * as Crypto from "../components/crypto/implementation.js";
import * as Depot from "../components/depot/implementation.js";
import * as Manners from "../components/manners/implementation.js";
import * as Reference from "../components/reference/implementation.js";
import * as Storage from "../components/storage/implementation.js";
import * as Events from "../events.js";
import * as Path from "../path/index.js";
import * as Ucan from "../ucan/index.js";
import { Partitioned, PartitionedNonEmpty, Partition, DistinctivePath } from "../path/index.js";
import { EventEmitter } from "../events.js";
import { Permissions } from "../permissions.js";
import { API, AssociatedIdentity, Links, PuttableUnixTree, UnixTree } from "./types.js";
import { PublishHook, Tree, File, SharedBy, ShareDetails, SoftLink } from "./types.js";
import RootTree from "./root/tree.js";
import PrivateFile from "./v1/PrivateFile.js";
import PrivateTree from "./v1/PrivateTree.js";
export declare type Dependencies = {
    crypto: Crypto.Implementation;
    depot: Depot.Implementation;
    manners: Manners.Implementation;
    reference: Reference.Implementation;
    storage: Storage.Implementation;
};
export declare type FileSystemOptions = {
    account: AssociatedIdentity;
    dependencies: Dependencies;
    eventEmitter: EventEmitter<Events.FileSystem>;
    localOnly?: boolean;
    permissions?: Permissions;
};
export declare type MutationOptions = {
    publish?: boolean;
};
export declare type NewFileSystemOptions = FileSystemOptions & {
    rootKey?: Uint8Array;
    version?: string;
};
declare type ConstructorParams = {
    account: AssociatedIdentity;
    dependencies: Dependencies;
    eventEmitter: EventEmitter<Events.FileSystem>;
    localOnly?: boolean;
    root: RootTree;
};
export declare class FileSystem implements API {
    account: AssociatedIdentity;
    dependencies: Dependencies;
    eventEmitter: EventEmitter<Events.FileSystem>;
    root: RootTree;
    readonly localOnly: boolean;
    proofs: {
        [_: string]: Ucan.Ucan;
    };
    publishHooks: Array<PublishHook>;
    _publishWhenOnline: Array<[CID, Ucan.Ucan]>;
    _publishing: false | [CID, true];
    constructor({ account, dependencies, eventEmitter, root, localOnly }: ConstructorParams);
    /**
     * Creates a file system with an empty public tree & an empty private tree at the root.
     */
    static empty(opts: NewFileSystemOptions): Promise<FileSystem>;
    /**
     * Loads an existing file system from a CID.
     */
    static fromCID(cid: CID, opts: FileSystemOptions): Promise<FileSystem>;
    /**
     * Deactivate a file system.
     *
     * Use this when a user signs out.
     * The only function of this is to stop listing to online/offline events.
     */
    deactivate(): void;
    ls(path: Path.Directory<Partitioned<Partition>>): Promise<Links>;
    mkdir(path: Path.Directory<PartitionedNonEmpty<Partition>>, options?: MutationOptions): Promise<this>;
    write(path: Path.Distinctive<Partitioned<Partition>>, content: Uint8Array | SoftLink | SoftLink[] | Record<string, SoftLink>, options?: MutationOptions): Promise<this>;
    read(path: Path.File<PartitionedNonEmpty<Partition>>): Promise<Uint8Array>;
    exists(path: Path.Distinctive<PartitionedNonEmpty<Partition>>): Promise<boolean>;
    get(path: Path.Distinctive<Partitioned<Partition>>): Promise<PuttableUnixTree | File | null>;
    mv(from: Path.Distinctive<PartitionedNonEmpty<Partition>>, to: Path.Distinctive<PartitionedNonEmpty<Partition>>): Promise<this>;
    /**
     * Resolve a symlink directly.
     * The `get` and `cat` methods will automatically resolve symlinks,
     * but sometimes when working with symlinks directly
     * you might want to use this method instead.
     */
    resolveSymlink(link: SoftLink): Promise<File | Tree | null>;
    rm(path: DistinctivePath<Partitioned<Partition>>): Promise<this>;
    /**
     * Make a symbolic link **at** a path.
     */
    symlink(args: {
        at: Path.Directory<Partitioned<Partition>>;
        referringTo: {
            path: Path.Distinctive<Partitioned<Partition>>;
            username?: string;
        };
        name: string;
    }): Promise<this>;
    /**
     * Ensures the latest version of the file system is added to IPFS,
     * updates your data root, and returns the root CID.
     */
    publish(): Promise<CID>;
    /**
     * Ensures the current version of your file system is "committed"
     * and stepped forward, so the current version will always be
     * persisted as an "step" in the history of the file system.
     *
     * This function is implicitly called every time your file system
     * changes are synced, so in most cases calling this is handled
     * for you.
     */
    historyStep(): Promise<void>;
    /**
     * Accept a share.
     * Copies the links to the items into your 'Shared with me' directory.
     * eg. `private/Shared with me/Sharer/`
     */
    acceptShare({ shareId, sharedBy }: {
        shareId: string;
        sharedBy: string;
    }): Promise<this>;
    /**
     * Loads a share.
     * Returns a "entry index", in other words,
     * a private tree with symlinks (soft links) to the shared items.
     */
    loadShare({ shareId, sharedBy }: {
        shareId: string;
        sharedBy: string;
    }): Promise<UnixTree>;
    /**
     * Share a private file with a user.
     */
    sharePrivate(paths: Path.Distinctive<Path.PartitionedNonEmpty<Path.Private>>[], { sharedBy, shareWith }: {
        sharedBy?: SharedBy;
        shareWith: string | string[];
    }): Promise<ShareDetails>;
    /** @internal */
    checkMutationPermissionAndAddProof(path: DistinctivePath<Partitioned<Partition>>, isMutation: boolean): Promise<void>;
    /** @internal */
    runMutationOnNode(path: DistinctivePath<Partitioned<Partition>>, handlers: {
        public(root: UnixTree, relPath: Path.Segments): Promise<void>;
        private(node: PrivateTree | PrivateFile, relPath: Path.Segments): Promise<void>;
    }): Promise<void>;
    /** @internal */
    runOnNode<A>(path: DistinctivePath<Partitioned<Partition>>, handlers: {
        public(root: UnixTree, relPath: Path.Segments): Promise<A>;
        private(node: Tree | File, relPath: Path.Segments): Promise<A>;
    }): Promise<A>;
    /** @internal
    * `put` should be called on the node returned from the function.
    * Normally this is handled by `runOnNode`.
    */
    runOnChildTree(node: Tree, relPath: Path.Segments, fn: (tree: Tree) => Promise<Tree>): Promise<Tree>;
    /** @internal */
    _whenOnline(): void;
    /** @internal */
    _beforeLeaving(e: Event): void | string;
}
export default FileSystem;
