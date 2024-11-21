import * as Check from "../types/check.js";
import * as Protocol from "../protocol/index.js";
import * as Link from "../link.js";
import { decodeCID } from "../../common/index.js";
import { isObject, hasProp } from "../../common/type-checks.js";
import BareFile from "../bare/file.js";
import BaseTree from "../base/tree.js";
class BareTree extends BaseTree {
    constructor(depot, links) {
        super();
        this.type = "BareTree";
        this.links = links;
        this.children = {};
        this.depot = depot;
    }
    static async empty(depot) {
        return new BareTree(depot, {});
    }
    static async fromCID(depot, cid) {
        const links = Link.arrToMap((await depot.getUnixDirectory(cid)));
        return new BareTree(depot, links);
    }
    static fromLinks(depot, links) {
        return new BareTree(depot, links);
    }
    static instanceOf(obj) {
        return isObject(obj)
            && hasProp(obj, "links")
            && hasProp(obj, "children")
            && hasProp(obj, "type")
            && obj.type === "BareTree";
    }
    async createChildTree(name, onUpdate) {
        const child = await BareTree.empty(this.depot);
        const existing = this.children[name];
        if (existing) {
            if (Check.isFile(existing)) {
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
            file = await BareFile.create(this.depot, content);
        }
        else if (BareFile.instanceOf(existing)) {
            file = await existing.updateContent(content);
        }
        else {
            throw new Error(`There is already a directory with that name: ${name}`);
        }
        await this.updateDirectChild(file, name, onUpdate);
        return file;
    }
    async putDetailed() {
        return Protocol.basic.putLinks(this.depot, this.links);
    }
    async putAndUpdateLink(child, name, onUpdate) {
        const details = await child.putDetailed();
        this.updateLink(name, details);
        onUpdate && await onUpdate();
        return this;
    }
    async updateDirectChild(child, name, onUpdate) {
        this.children[name] = child;
        return this.putAndUpdateLink(child, name, onUpdate);
    }
    removeDirectChild(name) {
        delete this.links[name];
        if (this.children[name]) {
            delete this.children[name];
        }
        return this;
    }
    async getDirectChild(name) {
        if (this.children[name]) {
            return this.children[name];
        }
        const link = this.links[name] || null;
        if (link === null)
            return null;
        const cid = decodeCID(link.cid);
        const child = link.isFile
            ? await BareFile.fromCID(this.depot, cid)
            : await BareTree.fromCID(this.depot, cid);
        // check that the child wasn't added while retrieving the content from the network
        if (this.children[name]) {
            return this.children[name];
        }
        this.children[name] = child;
        return child;
    }
    async get(path) {
        const [head, ...nextPath] = path;
        if (!head)
            return this;
        const nextTree = await this.getDirectChild(head);
        if (!nextPath.length) {
            return nextTree;
        }
        else if (nextTree === null || Check.isFile(nextTree)) {
            return null;
        }
        return nextTree.get(nextPath);
    }
    updateLink(name, result) {
        const { cid, size, isFile } = result;
        this.links[name] = Link.make(name, cid, isFile, size);
        return this;
    }
    getLinks() {
        return this.links;
    }
}
export default BareTree;
//# sourceMappingURL=tree.js.map