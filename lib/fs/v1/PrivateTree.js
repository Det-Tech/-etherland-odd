import * as Uint8arrays from "uint8arrays";
import * as Pathing from "../../path/index.js";
import BaseTree from "../base/tree.js";
import MMPT from "../protocol/private/mmpt.js";
import PrivateFile from "./PrivateFile.js";
import PrivateHistory from "./PrivateHistory.js";
import { DEFAULT_AES_ALG } from "../protocol/basic.js";
import { decodeCID, isObject, hasProp, mapObj, removeKeyFromObj, encodeCID } from "../../common/index.js";
import * as check from "../protocol/private/types/check.js";
import * as checkNormie from "../types/check.js";
import * as metadata from "../metadata.js";
import * as namefilter from "../protocol/private/namefilter.js";
import * as protocol from "../protocol/index.js";
import * as versions from "../versions.js";
export default class PrivateTree extends BaseTree {
    constructor({ crypto, depot, manners, reference, mmpt, key, header }) {
        super();
        this.crypto = crypto;
        this.depot = depot;
        this.manners = manners;
        this.reference = reference;
        this.children = {};
        this.header = header;
        this.key = key;
        this.mmpt = mmpt;
        this.history = new PrivateHistory(crypto, depot, toHistoryNode(this));
        function toHistoryNode(tree) {
            return {
                ...tree,
                fromInfo: async (mmpt, key, info) => toHistoryNode(await PrivateTree.fromInfo(crypto, depot, manners, reference, mmpt, key, info))
            };
        }
    }
    static instanceOf(obj) {
        return isObject(obj)
            && hasProp(obj, "mmpt")
            && hasProp(obj, "header")
            && check.isPrivateTreeInfo(obj.header);
    }
    static async create(crypto, depot, manners, reference, mmpt, key, parentNameFilter) {
        const bareNameFilter = parentNameFilter
            ? await namefilter.addToBare(crypto, parentNameFilter, namefilter.legacyEncodingMistake(key, "base64pad"))
            : await namefilter.createBare(crypto, key);
        return new PrivateTree({
            crypto,
            depot,
            manners,
            reference,
            mmpt,
            key,
            header: {
                metadata: metadata.empty(false, versions.latest),
                bareNameFilter,
                revision: 1,
                links: {},
                skeleton: {},
            }
        });
    }
    static async fromBaseKey(crypto, depot, manners, reference, mmpt, key) {
        const bareNameFilter = await namefilter.createBare(crypto, key);
        return this.fromBareNameFilter(crypto, depot, manners, reference, mmpt, bareNameFilter, key);
    }
    static async fromBareNameFilter(crypto, depot, manners, reference, mmpt, bareNameFilter, key) {
        const info = await protocol.priv.getLatestByBareNameFilter(depot, crypto, mmpt, bareNameFilter, key);
        return this.fromInfo(crypto, depot, manners, reference, mmpt, key, info);
    }
    static async fromLatestName(crypto, depot, manners, reference, mmpt, name, key) {
        const info = await protocol.priv.getLatestByName(depot, crypto, mmpt, name, key);
        return this.fromInfo(crypto, depot, manners, reference, mmpt, key, info);
    }
    static async fromName(crypto, depot, manners, reference, mmpt, name, key) {
        const info = await protocol.priv.getByName(depot, crypto, mmpt, name, key);
        return this.fromInfo(crypto, depot, manners, reference, mmpt, key, info);
    }
    static async fromInfo(crypto, depot, manners, reference, mmpt, key, info) {
        if (!check.isPrivateTreeInfo(info)) {
            throw new Error(`Could not parse a valid private tree using the given key`);
        }
        return new PrivateTree({ crypto, depot, manners, reference, mmpt, key, header: info });
    }
    async createChildTree(name, onUpdate) {
        const key = await this.crypto.aes.genKey(DEFAULT_AES_ALG).then(this.crypto.aes.exportKey);
        const child = await PrivateTree.create(this.crypto, this.depot, this.manners, this.reference, this.mmpt, key, this.header.bareNameFilter);
        const existing = this.children[name];
        if (existing) {
            if (PrivateFile.instanceOf(existing)) {
                throw new Error(`There is a file at the given path: ${name}`);
            }
            return existing;
        }
        await this.updateDirectChild(child, name, onUpdate);
        return child;
    }
    async createOrUpdateChildFile(content, name, onUpdate) {
        const existing = await this.getDirectChild(name);
        let file;
        if (existing === null) {
            const key = await this.crypto.aes.genKey(DEFAULT_AES_ALG).then(this.crypto.aes.exportKey);
            file = await PrivateFile.create(this.crypto, this.depot, this.mmpt, content, this.header.bareNameFilter, key);
        }
        else if (PrivateFile.instanceOf(existing)) {
            file = await existing.updateContent(content);
        }
        else {
            throw new Error(`There is already a directory with that name: ${name}`);
        }
        await this.updateDirectChild(file, name, onUpdate);
        return file;
    }
    async putDetailed() {
        // copy the object, so we're putting the current version & don't include any revisions
        const nodeCopy = Object.assign({}, this.header);
        // ensure all CIDs in skeleton are in string form, not sure where these CID objects are coming from
        nodeCopy.skeleton = ensureSkeletonStringCIDs(nodeCopy.skeleton);
        return protocol.priv.addNode(this.depot, this.crypto, this.mmpt, nodeCopy, this.key);
    }
    async updateDirectChild(child, name, onUpdate) {
        if (this.readOnly)
            throw new Error("Tree is read-only");
        await child.updateParentNameFilter(this.header.bareNameFilter);
        this.children[name] = child;
        const details = await child.putDetailed();
        this.updateLink(name, details);
        onUpdate && await onUpdate();
        return this;
    }
    removeDirectChild(name) {
        this.header = {
            ...this.header,
            revision: this.header.revision + 1,
            links: removeKeyFromObj(this.header.links, name),
            skeleton: removeKeyFromObj(this.header.skeleton, name)
        };
        if (this.children[name]) {
            delete this.children[name];
        }
        return this;
    }
    async getDirectChild(name) {
        let child = null;
        if (this.children[name]) {
            return this.children[name];
        }
        const childInfo = this.header.links[name];
        if (childInfo === undefined)
            return null;
        // Hard link
        if (check.isPrivateLink(childInfo)) {
            const key = Uint8arrays.fromString(childInfo.key, "base64pad");
            child = childInfo.isFile
                ? await PrivateFile.fromLatestName(this.crypto, this.depot, this.mmpt, childInfo.pointer, key)
                : await PrivateTree.fromLatestName(this.crypto, this.depot, this.manners, this.reference, this.mmpt, childInfo.pointer, key);
            // Soft link
        }
        else if (checkNormie.isSoftLink(childInfo)) {
            return PrivateTree.resolveSoftLink(this.crypto, this.depot, this.manners, this.reference, childInfo);
        }
        // Check that the child wasn't added while retrieving the content from the network
        if (this.children[name]) {
            return this.children[name];
        }
        if (child)
            this.children[name] = child;
        return child;
    }
    async getName() {
        const { bareNameFilter, revision } = this.header;
        const revisionFilter = await namefilter.addRevision(this.crypto, bareNameFilter, this.key, revision);
        return namefilter.toPrivateName(this.crypto, revisionFilter);
    }
    async updateParentNameFilter(parentNameFilter) {
        this.header.bareNameFilter = await namefilter.addToBare(this.crypto, parentNameFilter, namefilter.legacyEncodingMistake(this.key, "base64pad"));
        return this;
    }
    async get(path) {
        if (path.length === 0)
            return this;
        const [head, ...rest] = path;
        const next = this.header.skeleton[head];
        if (next === undefined)
            return null;
        return this.getRecurse(next, rest);
    }
    async getRecurse(nodeInfo, parts) {
        const [head, ...rest] = parts;
        if (checkNormie.isSoftLink(nodeInfo)) {
            const resolved = await PrivateTree.resolveSoftLink(this.crypto, this.depot, this.manners, this.reference, nodeInfo);
            if (!resolved)
                return null;
            if (head === undefined)
                return resolved;
            if (PrivateTree.instanceOf(resolved)) {
                return resolved.get(parts).then(makeReadOnly);
            }
            throw new Error("Was expecting a directory at: " + Pathing.log(parts));
        }
        if (head === undefined)
            return getNode(this.crypto, this.depot, this.manners, this.reference, this.mmpt, nodeInfo);
        const nextChild = nodeInfo.subSkeleton[head];
        if (nextChild !== undefined)
            return this.getRecurse(nextChild, rest);
        const reloadedNode = await protocol.priv.getLatestByCID(this.depot, this.crypto, this.mmpt, decodeCID(nodeInfo.cid), Uint8arrays.fromString(nodeInfo.key, "base64pad"));
        if (!check.isPrivateTreeInfo(reloadedNode))
            return null;
        const reloadedNext = reloadedNode.skeleton[head];
        return reloadedNext === undefined ? null : this.getRecurse(reloadedNext, rest);
    }
    // Links
    // -----
    assignLink({ name, link, skeleton }) {
        this.header.links[name] = link;
        this.header.skeleton[name] = skeleton;
        this.header.revision = this.header.revision + 1;
        this.header.metadata.unixMeta.mtime = Date.now();
    }
    static async resolveSoftLink(crypto, depot, manners, reference, link) {
        const domain = link.ipns.split("/")[0];
        if (!link.privateName || !link.key)
            throw new Error("Mixing public and private soft links is not supported yet.");
        const rootCid = await reference.dns.lookupDnsLink(domain);
        if (!rootCid)
            throw new Error(`Failed to resolve the soft link: ${link.ipns} - Could not resolve DNSLink`);
        const privateCid = (await protocol.basic.getSimpleLinks(depot, decodeCID(rootCid))).private.cid;
        const mmpt = await MMPT.fromCID(depot, decodeCID(privateCid));
        const key = Uint8arrays.fromString(link.key, "base64pad");
        const info = await protocol.priv.getLatestByName(depot, crypto, mmpt, link.privateName, key);
        if (!info)
            return null;
        const item = info.metadata.isFile
            ? await PrivateFile.fromInfo(crypto, depot, mmpt, key, info)
            : await PrivateTree.fromInfo(crypto, depot, manners, reference, mmpt, key, info);
        if (item)
            item.readOnly = true;
        return item;
    }
    getLinks() {
        return mapObj(this.header.links, (link) => {
            if (checkNormie.isSoftLink(link)) {
                return { ...link };
            }
            else {
                const { key, ...rest } = link;
                return { ...rest };
            }
        });
    }
    updateLink(name, result) {
        const { cid, size, isFile, skeleton } = result;
        const key = Uint8arrays.toString(result.key, "base64pad");
        const pointer = result.name;
        this.assignLink({
            name,
            link: { name, key, pointer, size, isFile: isFile },
            skeleton: { cid: encodeCID(cid), key, subSkeleton: skeleton }
        });
        return this;
    }
    insertSoftLink({ name, key, privateName, username }) {
        const softLink = {
            ipns: this.reference.dataRoot.domain(username),
            name,
            privateName,
            key: Uint8arrays.toString(key, "base64pad")
        };
        this.assignLink({
            name,
            link: softLink,
            skeleton: softLink
        });
        return this;
    }
}
// 🛠
async function getNode(crypto, depot, manners, reference, mmpt, nodeInfo) {
    const key = Uint8arrays.fromString(nodeInfo.key, "base64pad");
    const node = await protocol.priv.getLatestByCID(depot, crypto, mmpt, decodeCID(nodeInfo.cid), key);
    return check.isPrivateFileInfo(node)
        ? await PrivateFile.fromInfo(crypto, depot, mmpt, key, node)
        : await PrivateTree.fromInfo(crypto, depot, manners, reference, mmpt, key, node);
}
function ensureSkeletonStringCIDs(skeleton) {
    return Object.entries(skeleton).reduce((acc, [k, skeletonOrSoftLink]) => {
        let newValue = skeletonOrSoftLink;
        if (check.isPrivateSkeletonInfo(skeletonOrSoftLink)) {
            skeletonOrSoftLink.cid = decodeCID(skeletonOrSoftLink.cid).toString();
            skeletonOrSoftLink.subSkeleton = ensureSkeletonStringCIDs(skeletonOrSoftLink.subSkeleton);
        }
        return { ...acc, [k]: newValue };
    }, {});
}
function makeReadOnly(maybeFileOrTree) {
    if (maybeFileOrTree)
        maybeFileOrTree.readOnly = true;
    return maybeFileOrTree;
}
//# sourceMappingURL=PrivateTree.js.map