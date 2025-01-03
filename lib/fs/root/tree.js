import * as DagCBOR from "@ipld/dag-cbor";
import * as Uint8arrays from "uint8arrays";
import { RootBranch } from "../../path/index.js";
import { decodeCID, encodeCID } from "../../common/index.js";
import { permissionPaths, ROOT_FILESYSTEM_PERMISSIONS } from "../../permissions.js";
import * as DAG from "../../dag/index.js";
import * as Identifiers from "../../common/identifiers.js";
import * as Link from "../link.js";
import * as Path from "../../path/index.js";
import * as RootKey from "../../common/root-key.js";
import * as TypeChecks from "../../common/type-checks.js";
import * as Versions from "../versions.js";
import * as protocol from "../protocol/index.js";
import BareTree from "../bare/tree.js";
import MMPT from "../protocol/private/mmpt.js";
import PublicTree from "../v1/PublicTree.js";
import PrivateTree from "../v1/PrivateTree.js";
import PrivateFile from "../v1/PrivateFile.js";
import { PublicRootWasm } from "../v3/PublicRootWasm.js";
// CLASS
export default class RootTree {
    constructor({ dependencies, links, mmpt, privateLog, sharedCounter, sharedLinks, publicTree, prettyTree, privateNodes }) {
        this.dependencies = dependencies;
        this.links = links;
        this.mmpt = mmpt;
        this.privateLog = privateLog;
        this.sharedCounter = sharedCounter;
        this.sharedLinks = sharedLinks;
        this.publicTree = publicTree;
        this.prettyTree = prettyTree;
        this.privateNodes = privateNodes;
    }
    // INITIALISATION
    // --------------
    static async empty({ accountDID, dependencies, rootKey, wnfsWasm }) {
        if (wnfsWasm) {
            dependencies.manners.log(`⚠️ Running an EXPERIMENTAL new version of the file system: 3.0.0`);
        }
        const publicTree = wnfsWasm
            ? await PublicRootWasm.empty(dependencies)
            : await PublicTree.empty(dependencies.depot, dependencies.reference);
        const prettyTree = await BareTree.empty(dependencies.depot);
        const mmpt = MMPT.create(dependencies.depot);
        // Private tree
        const rootPath = Path.toPosix(Path.directory(Path.RootBranch.Private));
        const rootTree = await PrivateTree.create(dependencies.crypto, dependencies.depot, dependencies.manners, dependencies.reference, mmpt, rootKey, null);
        await rootTree.put();
        // Construct tree
        const tree = new RootTree({
            dependencies,
            links: {},
            mmpt,
            privateLog: [],
            sharedCounter: 1,
            sharedLinks: {},
            publicTree,
            prettyTree,
            privateNodes: {
                [rootPath]: rootTree
            }
        });
        // Store root key
        await RootKey.store({ accountDID, crypto: dependencies.crypto, readKey: rootKey });
        // Set version and store new sub trees
        await tree.setVersion(wnfsWasm ? Versions.wnfsWasm : Versions.latest);
        await Promise.all([
            tree.updatePuttable(RootBranch.Public, publicTree),
            tree.updatePuttable(RootBranch.Pretty, prettyTree),
            tree.updatePuttable(RootBranch.Private, mmpt)
        ]);
        // Fin
        return tree;
    }
    static async fromCID({ accountDID, dependencies, cid, permissions }) {
        const { crypto, depot, manners } = dependencies;
        const links = await protocol.basic.getSimpleLinks(dependencies.depot, cid);
        // Load root private tree by default
        const keys = await permissionKeys(crypto, accountDID, permissions || ROOT_FILESYSTEM_PERMISSIONS);
        const version = await parseVersionFromLinks(dependencies.depot, links);
        const wnfsWasm = Versions.equals(version, Versions.wnfsWasm);
        if (wnfsWasm) {
            dependencies.manners.log(`⚠️ Running an EXPERIMENTAL new version of the file system: 3.0.0`);
        }
        // Load public parts
        const publicCID = links[RootBranch.Public]?.cid || null;
        const publicTree = publicCID === null
            ? await PublicTree.empty(dependencies.depot, dependencies.reference)
            : wnfsWasm
                ? await PublicRootWasm.fromCID({ depot, manners }, decodeCID(publicCID))
                : await PublicTree.fromCID(dependencies.depot, dependencies.reference, decodeCID(publicCID));
        const prettyTree = links[RootBranch.Pretty]
            ? await BareTree.fromCID(dependencies.depot, decodeCID(links[RootBranch.Pretty].cid))
            : await BareTree.empty(dependencies.depot);
        // Load private bits
        const privateCID = links[RootBranch.Private]?.cid || null;
        let mmpt, privateNodes;
        if (privateCID === null) {
            mmpt = MMPT.create(dependencies.depot);
            privateNodes = {};
        }
        else {
            mmpt = await MMPT.fromCID(dependencies.depot, decodeCID(privateCID));
            privateNodes = await loadPrivateNodes(dependencies, accountDID, keys, mmpt);
        }
        const privateLogCid = links[RootBranch.PrivateLog]?.cid;
        const privateLog = privateLogCid
            ? await DAG.getPB(depot, decodeCID(privateLogCid))
                .then(dagNode => dagNode.Links.map(Link.fromDAGLink))
                .then(links => links.sort((a, b) => {
                return parseInt(a.name, 10) - parseInt(b.name, 10);
            }))
            : [];
        // Shared
        const sharedCid = links[RootBranch.Shared]?.cid || null;
        const sharedLinks = sharedCid
            ? await this.getSharedLinks(depot, decodeCID(sharedCid))
            : {};
        const sharedCounterCid = links[RootBranch.SharedCounter]?.cid || null;
        const sharedCounter = sharedCounterCid
            ? await protocol.basic
                .getFile(dependencies.depot, decodeCID(sharedCounterCid))
                .then(a => JSON.parse(Uint8arrays.toString(a, "utf8")))
            : 1;
        // Construct tree
        const tree = new RootTree({
            dependencies,
            links,
            mmpt,
            privateLog,
            sharedCounter,
            sharedLinks,
            publicTree,
            prettyTree,
            privateNodes
        });
        if (links[RootBranch.Version] == null) {
            // Old versions of WNFS didn't write a root version link
            await tree.setVersion(Versions.latest);
        }
        // Fin
        return tree;
    }
    // MUTATIONS
    // ---------
    async put() {
        const { cid } = await this.putDetailed();
        return cid;
    }
    async putDetailed() {
        return protocol.basic.putLinks(this.dependencies.depot, this.links);
    }
    updateLink(name, result) {
        const { cid, size, isFile } = result;
        this.links[name] = Link.make(name, cid, isFile, size);
        return this;
    }
    async updatePuttable(name, puttable) {
        return this.updateLink(name, await puttable.putDetailed());
    }
    // PRIVATE TREES
    // -------------
    findPrivateNode(path) {
        return findPrivateNode(this.privateNodes, path);
    }
    async addPrivateLogEntry(depot, cid) {
        const log = [...this.privateLog];
        let idx = Math.max(0, log.length - 1);
        // get last chunk
        let lastChunk = log[idx]?.cid
            ? (await depot
                .getUnixFile(decodeCID(log[idx].cid))
                .then(a => Uint8arrays.toString(a, "utf8"))
                .then(a => a.split(",")))
            : [];
        // needs new chunk
        const needsNewChunk = lastChunk.length + 1 > RootTree.LOG_CHUNK_SIZE;
        if (needsNewChunk) {
            idx = idx + 1;
            lastChunk = [];
        }
        // add to chunk
        const hashedCid = await this.dependencies.crypto.hash.sha256(Uint8arrays.fromString(encodeCID(cid), "utf8"));
        const updatedChunk = [...lastChunk, hashedCid];
        const updatedChunkDeposit = await protocol.basic.putFile(this.dependencies.depot, Uint8arrays.fromString(updatedChunk.join(","), "utf8"));
        log[idx] = {
            name: idx.toString(),
            cid: updatedChunkDeposit.cid,
            size: updatedChunkDeposit.size
        };
        // save log
        const logCID = await DAG.putPB(this.dependencies.depot, log.map(Link.toDAGLink));
        this.updateLink(RootBranch.PrivateLog, {
            cid: logCID,
            isFile: false,
            size: await this.dependencies.depot.size(logCID)
        });
        this.privateLog = log;
    }
    // SHARING
    // -------
    async addShares(links) {
        this.sharedLinks = links.reduce((acc, link) => ({ ...acc, [link.name]: link }), this.sharedLinks);
        const cborApprovedLinks = Object.values(this.sharedLinks).reduce((acc, { cid, name, size }) => ({
            ...acc,
            [name]: { cid, name, size }
        }), {});
        const cid = await this.dependencies.depot.putBlock(DagCBOR.encode(cborApprovedLinks), DagCBOR.code);
        this.updateLink(RootBranch.Shared, {
            cid: cid,
            isFile: false,
            size: await this.dependencies.depot.size(cid)
        });
        return this;
    }
    static async getSharedLinks(depot, cid) {
        const block = await depot.getBlock(cid);
        const decodedBlock = DagCBOR.decode(block);
        if (!TypeChecks.isObject(decodedBlock))
            throw new Error("Invalid shared section, not an object");
        return Object.values(decodedBlock).reduce((acc, link) => {
            if (!TypeChecks.isObject(link))
                return acc;
            const name = link.name ? link.name : null;
            const cid = link.cid
                ? decodeCID(link.cid)
                : null;
            if (!name || !cid)
                return acc;
            return { ...acc, [name]: { name, cid, size: (link.size || 0) } };
        }, {});
    }
    async setSharedCounter(counter) {
        this.sharedCounter = counter;
        const { cid, size } = await protocol.basic.putFile(this.dependencies.depot, Uint8arrays.fromString(JSON.stringify(counter), "utf8"));
        this.updateLink(RootBranch.SharedCounter, {
            cid: cid,
            isFile: true,
            size: size
        });
        return counter;
    }
    async bumpSharedCounter() {
        const newCounter = this.sharedCounter + 1;
        return this.setSharedCounter(newCounter);
    }
    // VERSION
    // -------
    async setVersion(v) {
        const version = Uint8arrays.fromString(Versions.toString(v), "utf8");
        const result = await protocol.basic.putFile(this.dependencies.depot, version);
        return this.updateLink(RootBranch.Version, result);
    }
    async getVersion() {
        return await parseVersionFromLinks(this.dependencies.depot, this.links);
    }
}
// PRIVATE LOG
// -----------
// CBOR array containing chunks.
//
// Chunk size is based on the default IPFS block size,
// which is 1024 * 256 bytes. 1 log chunk should fit in 1 block.
// We'll use the CSV format for the data in the chunks.
RootTree.LOG_CHUNK_SIZE = 1020; // Math.floor((1024 * 256) / (256 + 1))
async function findBareNameFilter(crypto, storage, accountDID, map, path) {
    const bareNameFilterId = await Identifiers.bareNameFilter({ accountDID, crypto, path });
    const bareNameFilter = await storage.getItem(bareNameFilterId);
    if (bareNameFilter)
        return bareNameFilter;
    const [nodePath, node] = findPrivateNode(map, path);
    if (!node)
        return null;
    const unwrappedPath = Path.unwrap(path);
    const relativePath = unwrappedPath.slice(Path.unwrap(nodePath).length);
    if (PrivateFile.instanceOf(node)) {
        return relativePath.length === 0 ? node.header.bareNameFilter : null;
    }
    if (!node.exists(relativePath)) {
        if (Path.isDirectory(path))
            await node.mkdir(relativePath);
        else
            await node.add(relativePath, new Uint8Array());
    }
    return node.get(relativePath).then(t => t ? t.header.bareNameFilter : null);
}
function findPrivateNode(map, path) {
    const t = map[Path.toPosix(path)];
    if (t)
        return [path, t];
    const parent = Path.parent(path);
    return parent
        ? findPrivateNode(map, parent)
        : [path, null];
}
function loadPrivateNodes(dependencies, accountDID, pathKeys, mmpt) {
    const { crypto, storage } = dependencies;
    return sortedPathKeys(pathKeys).reduce((acc, { path, key }) => {
        return acc.then(async (map) => {
            let privateNode;
            const unwrappedPath = Path.unwrap(path);
            // if root, no need for bare name filter
            if (unwrappedPath.length === 1 && unwrappedPath[0] === Path.RootBranch.Private) {
                privateNode = await PrivateTree.fromBaseKey(dependencies.crypto, dependencies.depot, dependencies.manners, dependencies.reference, mmpt, key);
            }
            else {
                const bareNameFilter = await findBareNameFilter(crypto, storage, accountDID, map, path);
                if (!bareNameFilter)
                    throw new Error(`Was trying to load the PrivateTree for the path \`${path}\`, but couldn't find the bare name filter for it.`);
                if (Path.isDirectory(path)) {
                    privateNode = await PrivateTree.fromBareNameFilter(dependencies.crypto, dependencies.depot, dependencies.manners, dependencies.reference, mmpt, bareNameFilter, key);
                }
                else {
                    privateNode = await PrivateFile.fromBareNameFilter(dependencies.crypto, dependencies.depot, mmpt, bareNameFilter, key);
                }
            }
            const posixPath = Path.toPosix(path);
            return { ...map, [posixPath]: privateNode };
        });
    }, Promise.resolve({}));
}
async function parseVersionFromLinks(depot, links) {
    const file = await protocol.basic.getFile(depot, decodeCID(links[RootBranch.Version].cid));
    return Versions.fromString(Uint8arrays.toString(file)) ?? Versions.v0;
}
async function permissionKeys(crypto, accountDID, permissions) {
    return permissionPaths(permissions).reduce(async (acc, path) => {
        if (Path.isPartition(Path.RootBranch.Public, path))
            return acc;
        const name = await Identifiers.readKey({ accountDID, crypto, path });
        const key = await crypto.keystore.exportSymmKey(name);
        const pk = { path: path, key: key };
        return acc.then(list => [...list, pk]);
    }, Promise.resolve([]));
}
/**
 * Sort keys alphabetically by path.
 * This is used to sort paths by parent first.
 */
function sortedPathKeys(list) {
    return list.sort((a, b) => Path.toPosix(a.path).localeCompare(Path.toPosix(b.path)));
}
//# sourceMappingURL=tree.js.map