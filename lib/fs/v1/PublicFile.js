import * as Check from "../types/check.js";
import * as Metadata from "../metadata.js";
import * as Protocol from "../protocol/index.js";
import * as Versions from "../versions.js";
import { decodeCID, isObject, hasProp } from "../../common/index.js";
import BaseFile from "../base/file.js";
import PublicHistory from "./PublicHistory.js";
export class PublicFile extends BaseFile {
    constructor({ depot, content, header, cid }) {
        super(content);
        this.depot = depot;
        this.cid = cid;
        this.header = header;
        this.history = new PublicHistory(toHistoryNode(this));
        function toHistoryNode(file) {
            return {
                ...file,
                fromCID: async (cid) => toHistoryNode(await PublicFile.fromCID(depot, cid))
            };
        }
    }
    static instanceOf(obj) {
        return isObject(obj)
            && hasProp(obj, "content")
            && hasProp(obj, "header")
            && Check.isFileHeader(obj.header);
    }
    static async create(depot, content) {
        return new PublicFile({
            depot,
            content,
            header: { metadata: Metadata.empty(true, Versions.latest) },
            cid: null
        });
    }
    static async fromCID(depot, cid) {
        const info = await Protocol.pub.get(depot, cid);
        return PublicFile.fromInfo(depot, info, cid);
    }
    static async fromInfo(depot, info, cid) {
        const { userland, metadata, previous } = info;
        const content = await Protocol.basic.getFile(depot, decodeCID(userland));
        return new PublicFile({
            depot,
            content,
            header: { metadata, previous },
            cid
        });
    }
    async putDetailed() {
        const details = await Protocol.pub.putFile(this.depot, this.content, Metadata.updateMtime(this.header.metadata), this.cid);
        this.cid = details.cid;
        return details;
    }
}
export default PublicFile;
//# sourceMappingURL=PublicFile.js.map