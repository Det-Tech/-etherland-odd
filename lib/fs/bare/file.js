import * as Protocol from "../protocol/index.js";
import { isObject, hasProp } from "../../common/index.js";
import BaseFile from "../base/file.js";
export class BareFile extends BaseFile {
    constructor(depot, content) {
        super(content);
        this.depot = depot;
    }
    static create(depot, content) {
        return new BareFile(depot, content);
    }
    static async fromCID(depot, cid) {
        const content = await Protocol.basic.getFile(depot, cid);
        return new BareFile(depot, content);
    }
    static instanceOf(obj) {
        return isObject(obj) && hasProp(obj, "content");
    }
    async put() {
        const { cid } = await this.putDetailed();
        return cid;
    }
    async putDetailed() {
        return Protocol.basic.putFile(this.depot, this.content);
    }
}
export default BareFile;
//# sourceMappingURL=file.js.map