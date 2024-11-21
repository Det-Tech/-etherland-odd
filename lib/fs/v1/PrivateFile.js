import * as Uint8arrays from "uint8arrays";
import * as check from "../protocol/private/types/check.js";
import * as metadata from "../metadata.js";
import * as protocol from "../protocol/index.js";
import * as namefilter from "../protocol/private/namefilter.js";
import * as versions from "../versions.js";
import BaseFile from "../base/file.js";
import PrivateHistory from "./PrivateHistory.js";
import { DEFAULT_AES_ALG } from "../protocol/basic.js";
import { hasProp, isObject } from "../../common/type-checks.js";
import { decodeCID, encodeCID } from "../../common/index.js";
export class PrivateFile extends BaseFile {
    constructor({ crypto, depot, content, mmpt, key, header }) {
        super(content);
        this.crypto = crypto;
        this.depot = depot;
        this.header = header;
        this.key = key;
        this.mmpt = mmpt;
        this.history = new PrivateHistory(crypto, depot, toHistoryNode(this));
        function toHistoryNode(file) {
            return {
                ...file,
                fromInfo: async (mmpt, key, info) => toHistoryNode(await PrivateFile.fromInfo(crypto, depot, mmpt, key, info))
            };
        }
    }
    static instanceOf(obj) {
        return isObject(obj)
            && hasProp(obj, "content")
            && hasProp(obj, "mmpt")
            && hasProp(obj, "header")
            && check.isPrivateFileInfo(obj.header);
    }
    static async create(crypto, depot, mmpt, content, parentNameFilter, key) {
        const contentKey = await crypto.aes.exportKey(await crypto.aes.genKey(DEFAULT_AES_ALG));
        const bareNameFilter = await namefilter.addToBare(crypto, parentNameFilter, namefilter.legacyEncodingMistake(key, "base64pad"));
        const contentInfo = await protocol.basic.putEncryptedFile(depot, crypto, content, contentKey);
        return new PrivateFile({
            crypto,
            depot,
            content,
            mmpt,
            key,
            header: {
                bareNameFilter,
                key: Uint8arrays.toString(contentKey, "base64pad"),
                revision: 1,
                metadata: metadata.empty(true, versions.latest),
                content: encodeCID(contentInfo.cid)
            }
        });
    }
    static async fromBareNameFilter(crypto, depot, mmpt, bareNameFilter, key) {
        const info = await protocol.priv.getLatestByBareNameFilter(depot, crypto, mmpt, bareNameFilter, key);
        return this.fromInfo(crypto, depot, mmpt, key, info);
    }
    static async fromLatestName(crypto, depot, mmpt, name, key) {
        const info = await protocol.priv.getLatestByName(depot, crypto, mmpt, name, key);
        return PrivateFile.fromInfo(crypto, depot, mmpt, key, info);
    }
    static async fromName(crypto, depot, mmpt, name, key) {
        const info = await protocol.priv.getByName(depot, crypto, mmpt, name, key);
        return PrivateFile.fromInfo(crypto, depot, mmpt, key, info);
    }
    static async fromInfo(crypto, depot, mmpt, key, info) {
        if (!check.isPrivateFileInfo(info)) {
            throw new Error(`Could not parse a valid private file using the given key`);
        }
        const content = await protocol.basic.getEncryptedFile(depot, crypto, decodeCID(info.content), Uint8arrays.fromString(info.key, "base64pad"));
        return new PrivateFile({
            crypto,
            depot,
            content,
            key,
            mmpt,
            header: info
        });
    }
    async getName() {
        const { bareNameFilter, revision } = this.header;
        const revisionFilter = await namefilter.addRevision(this.crypto, bareNameFilter, this.key, revision);
        return namefilter.toPrivateName(this.crypto, revisionFilter);
    }
    async updateParentNameFilter(parentNameFilter) {
        this.header.bareNameFilter = await namefilter.addToBare(this.crypto, parentNameFilter, namefilter.legacyEncodingMistake(Uint8arrays.fromString(this.header.key, "base64pad"), "base64pad"));
        return this;
    }
    async updateContent(content) {
        const contentInfo = await protocol.basic.putEncryptedFile(this.depot, this.crypto, content, Uint8arrays.fromString(this.header.key, "base64pad"));
        this.content = content;
        this.header = {
            ...this.header,
            revision: this.header.revision + 1,
            content: encodeCID(contentInfo.cid)
        };
        return this;
    }
    async putDetailed() {
        return protocol.priv.addNode(this.depot, this.crypto, this.mmpt, {
            ...this.header,
            metadata: metadata.updateMtime(this.header.metadata)
        }, this.key);
    }
}
export default PrivateFile;
//# sourceMappingURL=PrivateFile.js.map