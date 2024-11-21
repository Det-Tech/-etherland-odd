import { CID } from "multiformats";
import { default as init, PublicDirectory } from "wnfs";
import { WASM_WNFS_VERSION } from "../../common/version.js";
import { DepotBlockStore } from "./DepotBlockStore.js";
import { BaseFile } from "../base/file.js";
// This is some global mutable state to work around global mutable state
// issues with wasm-bindgen. It's important we *never* accidentally initialize the
// "wnfs" Wasm module twice.
let initialized = false;
async function loadWasm({ manners }) {
    // MUST be prevented from initializing twice:
    // https://github.com/oddsdk/ts-odd/issues/429
    // https://github.com/rustwasm/wasm-bindgen/issues/3307
    if (initialized)
        return;
    initialized = true;
    manners.log(`⏬ Loading WNFS WASM`);
    const before = performance.now();
    // init accepts Promises as arguments
    await init(manners.wnfsWasmLookup(WASM_WNFS_VERSION));
    const time = performance.now() - before;
    manners.log(`🧪 Loaded WNFS WASM (${time.toFixed(0)}ms)`);
}
// ROOT
export class PublicRootWasm {
    constructor(dependencies, root, store, readOnly) {
        this.dependencies = dependencies;
        this.root = Promise.resolve(root);
        this.lastRoot = root;
        this.store = store;
        this.readOnly = readOnly;
    }
    static async empty(dependencies) {
        await loadWasm(dependencies);
        const store = new DepotBlockStore(dependencies.depot);
        const root = new PublicDirectory(new Date());
        return new PublicRootWasm(dependencies, root, store, false);
    }
    static async fromCID(dependencies, cid) {
        await loadWasm(dependencies);
        const store = new DepotBlockStore(dependencies.depot);
        const root = await PublicDirectory.load(cid.bytes, store);
        return new PublicRootWasm(dependencies, root, store, false);
    }
    async atomically(fn) {
        const root = await this.root;
        this.root = fn(root);
        await this.root;
    }
    async withError(operation, opDescription) {
        try {
            return await operation;
        }
        catch (e) {
            console.error(`Error during WASM operation ${opDescription}:`);
            throw e;
        }
    }
    async ls(path) {
        const root = await this.root;
        const { result: node } = await this.withError(root.getNode(path, this.store), `ls(${path.join("/")})`);
        if (node == null) {
            throw new Error(`Can't ls ${path.join("/")}: No such directory`);
        }
        if (!node.isDir()) {
            throw new Error(`Can't ls ${path.join("/")}: Not a directory`);
        }
        const directory = node.asDir();
        const { result: entries } = await this.withError(root.ls(path, this.store), `ls(${path.join("/")})`);
        const result = {};
        for (const entry of entries) {
            const node = await directory.lookupNode(entry.name, this.store);
            const cid = node.isFile()
                ? CID.decode(await node.asFile().store(this.store))
                : CID.decode(await node.asDir().store(this.store));
            result[entry.name] = {
                name: entry.name,
                isFile: entry.metadata.unixMeta.kind === "file",
                size: 0,
                cid,
            };
        }
        return result;
    }
    async mkdir(path) {
        await this.atomically(async (root) => {
            const { rootDir } = await this.withError(root.mkdir(path, new Date(), this.store), `mkdir(${path.join("/")})`);
            return rootDir;
        });
        return this;
    }
    async cat(path) {
        const root = await this.root;
        const { result: cidBytes } = await this.withError(root.read(path, this.store), `read(${path.join("/")})`);
        const cid = CID.decode(cidBytes);
        return this.dependencies.depot.getUnixFile(cid);
    }
    async add(path, content) {
        const { cid } = await this.dependencies.depot.putChunked(content);
        await this.atomically(async (root) => {
            const { rootDir } = await this.withError(root.write(path, cid.bytes, new Date(), this.store), `write(${path.join("/")})`);
            return rootDir;
        });
        return this;
    }
    async rm(path) {
        await this.atomically(async (root) => {
            const { rootDir } = await this.withError(root.rm(path, this.store), `rm(${path.join("/")})`);
            return rootDir;
        });
        return this;
    }
    async mv(from, to) {
        await this.atomically(async (root) => {
            const { rootDir } = await this.withError(root.basicMv(from, to, new Date(), this.store), `basicMv(${from.join("/")}, ${to.join("/")})`);
            return rootDir;
        });
        return this;
    }
    async get(path) {
        const root = await this.root;
        const { result: node } = await this.withError(root.getNode(path, this.store), `getNode(${path.join("/")})`);
        if (node == null) {
            return null;
        }
        if (node.isFile()) {
            const cachedFile = node.asFile();
            const content = await this.cat(path);
            const directory = path.slice(0, -1);
            const filename = path[path.length - 1];
            return new PublicFileWasm(content, directory, filename, this, cachedFile);
        }
        else if (node.isDir()) {
            const cachedDir = node.asDir();
            return new PublicDirectoryWasm(this.readOnly, path, this, cachedDir);
        }
        throw new Error(`Unknown node type. Can only handle files and directories.`);
    }
    async exists(path) {
        const root = await this.root;
        try {
            await root.getNode(path, this.store);
            return true;
        }
        catch {
            return false;
        }
    }
    async historyStep() {
        await this.atomically(async (root) => {
            const { rootDir: rebasedRoot } = await root.baseHistoryOn(this.lastRoot, this.store);
            this.lastRoot = root;
            return rebasedRoot;
        });
        return await this.root;
    }
    async put() {
        const rebasedRoot = await this.historyStep();
        const cidBytes = await rebasedRoot.store(this.store);
        return CID.decode(cidBytes);
    }
    async putDetailed() {
        return {
            cid: await this.put(),
            size: 0,
            isFile: false,
        };
    }
}
// DIRECTORY
export class PublicDirectoryWasm {
    constructor(readOnly, directory, publicRoot, cachedDir) {
        this.readOnly = readOnly;
        this.directory = directory;
        this.publicRoot = publicRoot;
        this.cachedDir = cachedDir;
    }
    checkMutability(operation) {
        if (this.readOnly)
            throw new Error(`Directory is read-only. Cannot ${operation}`);
    }
    async updateCache() {
        const root = await this.publicRoot.root;
        const node = await root.getNode(this.directory, this.publicRoot.store);
        this.cachedDir = node.asDir();
    }
    get header() {
        return nodeHeader(this.cachedDir);
    }
    async ls(path) {
        return await this.publicRoot.ls([...this.directory, ...path]);
    }
    async mkdir(path) {
        this.checkMutability(`mkdir at ${[...this.directory, ...path].join("/")}`);
        await this.publicRoot.mkdir([...this.directory, ...path]);
        await this.updateCache();
        return this;
    }
    async cat(path) {
        return await this.publicRoot.cat([...this.directory, ...path]);
    }
    async add(path, content) {
        this.checkMutability(`write at ${[...this.directory, ...path].join("/")}`);
        await this.publicRoot.add([...this.directory, ...path], content);
        await this.updateCache();
        return this;
    }
    async rm(path) {
        this.checkMutability(`remove at ${[...this.directory, ...path].join("/")}`);
        await this.publicRoot.rm([...this.directory, ...path]);
        await this.updateCache();
        return this;
    }
    async mv(from, to) {
        this.checkMutability(`mv from ${[...this.directory, ...from].join("/")} to ${[...this.directory, ...to].join("/")}`);
        await this.publicRoot.mv([...this.directory, ...from], [...this.directory, ...to]);
        await this.updateCache();
        return this;
    }
    async get(path) {
        return await this.publicRoot.get([...this.directory, ...path]);
    }
    async exists(path) {
        return await this.publicRoot.exists([...this.directory, ...path]);
    }
    async put() {
        await this.publicRoot.put();
        const root = await this.publicRoot.root;
        const cidBytes = await root.store(this.publicRoot.store);
        return CID.decode(cidBytes);
    }
    async putDetailed() {
        return {
            isFile: false,
            size: 0,
            cid: await this.put()
        };
    }
}
// FILE
// This is somewhat of a weird hack of providing a result for a `get()` operation.
export class PublicFileWasm extends BaseFile {
    constructor(content, directory, filename, publicRoot, cachedFile) {
        super(content);
        this.directory = directory;
        this.filename = filename;
        this.publicRoot = publicRoot;
        this.cachedFile = cachedFile;
    }
    async updateCache() {
        const root = await this.publicRoot.root;
        const node = await root.getNode([...this.directory, this.filename], this.publicRoot.store);
        this.cachedFile = node.asFile();
    }
    get header() {
        return nodeHeader(this.cachedFile);
    }
    async updateContent(content) {
        await super.updateContent(content);
        await this.updateCache();
        return this;
    }
    async putDetailed() {
        const root = await this.publicRoot.root;
        const path = [...this.directory, this.filename];
        const { result: node } = await root.getNode(path, this.publicRoot.store);
        if (node == null) {
            throw new Error(`No file at /${path.join("/")}.`);
        }
        if (!node.isFile()) {
            throw new Error(`Not a file at /${path.join("/")}`);
        }
        const file = node.asFile();
        return {
            isFile: true,
            size: 0,
            cid: CID.decode(await file.store(this.publicRoot.store))
        };
    }
}
function nodeHeader(node) {
    // There's some differences between the two.
    const meta = node.metadata();
    const metadata = {
        isFile: meta.unixMeta.kind === "file",
        version: meta.version,
        unixMeta: {
            _type: meta.unixMeta.kind,
            ctime: Number(meta.unixMeta.created),
            mtime: Number(meta.unixMeta.modified),
            mode: meta.unixMeta.mode,
        }
    };
    const previous = node.previousCid();
    return previous == null ? { metadata } : {
        metadata,
        previous: CID.decode(previous),
    };
}
//# sourceMappingURL=PublicRootWasm.js.map