import * as Uint8arrays from "uint8arrays";
import * as Basic from "../basic.js";
import * as Check from "./types/check.js";
import * as Namefilter from "./namefilter.js";
import { decodeCID } from "../../../common/index.js";
export const addNode = async (depot, crypto, mmpt, node, key) => {
    const { cid, size } = await Basic.putEncryptedFile(depot, crypto, node, key);
    const filter = await Namefilter.addRevision(crypto, node.bareNameFilter, key, node.revision);
    const name = await Namefilter.toPrivateName(crypto, filter);
    await mmpt.add(name, cid);
    // if the node is a file, we also add the content to the MMPT
    if (Check.isPrivateFileInfo(node)) {
        const key = Uint8arrays.fromString(node.key, "base64pad");
        const contentBareFilter = await Namefilter.addToBare(crypto, node.bareNameFilter, Namefilter.legacyEncodingMistake(key, "base64pad"));
        const contentFilter = await Namefilter.addRevision(crypto, contentBareFilter, key, node.revision);
        const contentName = await Namefilter.toPrivateName(crypto, contentFilter);
        await mmpt.add(contentName, decodeCID(node.content));
    }
    const [skeleton, isFile] = Check.isPrivateFileInfo(node) ? [{}, true] : [node.skeleton, false];
    return { cid, name, key, size, isFile, skeleton };
};
export const readNode = async (depot, crypto, cid, key) => {
    const contentBytes = await Basic.getEncryptedFile(depot, crypto, cid, key);
    const content = JSON.parse(Uint8arrays.toString(contentBytes, "utf8"));
    if (!Check.isDecryptedNode(content)) {
        throw new Error(`Could not parse a valid filesystem object: ${content}`);
    }
    return content;
};
export const getByName = async (depot, crypto, mmpt, name, key) => {
    const cid = await mmpt.get(name);
    if (cid === null)
        return null;
    return getByCID(depot, crypto, cid, key);
};
export const getByCID = async (depot, crypto, cid, key) => {
    return await readNode(depot, crypto, cid, key);
};
export const getLatestByName = async (depot, crypto, mmpt, name, key) => {
    const cid = await mmpt.get(name);
    if (cid === null)
        return null;
    return getLatestByCID(depot, crypto, mmpt, cid, key);
};
export const getLatestByCID = async (depot, crypto, mmpt, cid, key) => {
    const node = await getByCID(depot, crypto, cid, key);
    const latest = await findLatestRevision(crypto, mmpt, node.bareNameFilter, key, node.revision);
    return latest?.cid
        ? await getByCID(depot, crypto, decodeCID(latest?.cid), key)
        : node;
};
export const getLatestByBareNameFilter = async (depot, crypto, mmpt, bareName, key) => {
    const revisionFilter = await Namefilter.addRevision(crypto, bareName, key, 1);
    const name = await Namefilter.toPrivateName(crypto, revisionFilter);
    return getLatestByName(depot, crypto, mmpt, name, key);
};
export const findLatestRevision = async (crypto, mmpt, bareName, key, lastKnownRevision) => {
    // Exponential search forward
    let lowerBound = lastKnownRevision, upperBound = null;
    let i = 0;
    let lastRevision = null;
    while (upperBound === null) {
        const toCheck = lastKnownRevision + Math.pow(2, i);
        const thisRevision = await getRevision(crypto, mmpt, bareName, key, toCheck);
        if (thisRevision !== null) {
            lastRevision = thisRevision;
            lowerBound = toCheck;
        }
        else {
            upperBound = toCheck;
        }
        i++;
    }
    // Binary search back
    while (lowerBound < (upperBound - 1)) {
        const midpoint = Math.floor((upperBound + lowerBound) / 2);
        const thisRevision = await getRevision(crypto, mmpt, bareName, key, midpoint);
        if (thisRevision !== null) {
            lastRevision = thisRevision;
            lowerBound = midpoint;
        }
        else {
            upperBound = midpoint;
        }
    }
    return lastRevision;
};
export const getRevision = async (crypto, mmpt, bareName, key, revision) => {
    const filter = await Namefilter.addRevision(crypto, bareName, key, revision);
    const name = await Namefilter.toPrivateName(crypto, filter);
    const cid = await mmpt.get(name);
    return cid ? { cid, name, number: revision } : null;
};
//# sourceMappingURL=index.js.map