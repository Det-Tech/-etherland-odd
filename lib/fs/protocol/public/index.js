import * as DagCBOR from "@ipld/dag-cbor";
import * as Uint8arrays from "uint8arrays";
import { CID } from "multiformats/cid";
import * as Check from "../../types/check.js";
import * as Link from "../../link.js";
import * as Basic from "../basic.js";
import { decodeCID, isValue } from "../../../common/index.js";
export const putTree = async (depot, links, skeletonVal, metadataVal, previousCID) => {
    const userlandInfo = await Basic.putLinks(depot, links);
    const userland = Link.make("userland", userlandInfo.cid, true, userlandInfo.size);
    const [metadata, skeleton] = await Promise.all([
        putAndMakeLink(depot, "metadata", metadataVal),
        putAndMakeLink(depot, "skeleton", skeletonVal),
    ]);
    const previous = previousCID != null
        ? Link.make("previous", previousCID, false, await depot.size(previousCID))
        : undefined;
    const internalLinks = { metadata, skeleton, userland, previous };
    const { cid, size } = await Basic.putLinks(depot, internalLinks);
    return {
        cid,
        userland: decodeCID(userland.cid),
        metadata: decodeCID(metadata.cid),
        size,
        isFile: false,
        skeleton: skeletonVal
    };
};
export const putFile = async (depot, content, metadataVal, previousCID) => {
    const userlandInfo = await Basic.putFile(depot, content);
    const userland = Link.make("userland", userlandInfo.cid, true, userlandInfo.size);
    const metadata = await putAndMakeLink(depot, "metadata", metadataVal);
    const previous = previousCID != null
        ? Link.make("previous", previousCID, false, await depot.size(previousCID))
        : undefined;
    const internalLinks = { metadata, userland, previous };
    const { cid, size } = await Basic.putLinks(depot, internalLinks);
    return {
        cid,
        userland: decodeCID(userland.cid),
        metadata: decodeCID(metadata.cid),
        size,
        isFile: true,
        skeleton: {}
    };
};
export const get = async (depot, cid) => {
    const links = await Basic.getSimpleLinks(depot, cid);
    const metadata = await getAndCheckValue(depot, links, "metadata", Check.isMetadata);
    const skeleton = metadata.isFile
        ? undefined
        : await getAndCheckValue(depot, links, "skeleton", Check.isSkeleton);
    const userland = links["userland"]?.cid || null;
    if (!Check.isCID(userland))
        throw new Error("Could not find userland");
    const previous = links["previous"]?.cid || undefined;
    return { userland, metadata, previous, skeleton };
};
export const getValue = async (depot, linksOrCID, name) => {
    const cid = CID.asCID(linksOrCID);
    if (Check.isCID(linksOrCID)) {
        if (!cid)
            return null;
        const links = await Basic.getSimpleLinks(depot, cid);
        return getValueFromLinks(depot, links, name);
    }
    return getValueFromLinks(depot, linksOrCID, name);
};
export const getValueFromLinks = async (depot, links, name) => {
    const linkCID = links[name]?.cid;
    if (!linkCID)
        return null;
    const file = await Basic.getFile(depot, decodeCID(linkCID));
    const a = DagCBOR.decode(file);
    let b;
    if (a instanceof Uint8Array) {
        b = JSON.parse(Uint8arrays.toString(a, "utf8"));
    }
    else {
        b = a;
    }
    return b;
};
export const getAndCheckValue = async (depot, linksOrCid, name, checkFn, canBeNull = false) => {
    const val = await getValue(depot, linksOrCid, name);
    return checkValue(val, name, checkFn, canBeNull);
};
export const checkValue = (val, name, checkFn, canBeNull = false) => {
    if (!isValue(val)) {
        if (canBeNull)
            return val;
        throw new Error(`Could not find header value: ${name}`);
    }
    if (checkFn(val)) {
        return val;
    }
    throw new Error(`Improperly formatted header value: ${name}`);
};
// ㊙️
async function putAndMakeLink(depot, name, val) {
    const { cid, size } = await Basic.putFile(depot, DagCBOR.encode(val));
    return Link.make(name, cid, true, size);
}
//# sourceMappingURL=index.js.map