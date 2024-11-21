import { CID } from "multiformats/cid";
import { isString, isObject, isNum, isBool } from "../../common/index.js";
export const isFile = (obj) => {
    return isObject(obj) && obj.content !== undefined;
};
export const isTree = (obj) => {
    return isObject(obj) && obj.ls !== undefined;
};
export const isBaseLink = (obj) => {
    return isObject(obj)
        && isString(obj.name)
        && isNum(obj.size)
        && isBool(obj.isFile);
};
export const isSimpleLink = (obj) => {
    return isObject(obj)
        && isString(obj.name)
        && isNum(obj.size)
        && isCID(obj.cid);
};
export const isSoftLink = (obj) => {
    return isObject(obj)
        && isString(obj.name)
        && isString(obj.ipns);
};
export const isSoftLinkDictionary = (obj) => {
    if (isObject(obj)) {
        const values = Object.values(obj);
        return values.length > 0 && values.every(isSoftLink);
    }
    return false;
};
export const isSoftLinkList = (obj) => {
    return Array.isArray(obj) && obj.every(isSoftLink);
};
export const isHardLink = (obj) => {
    return isBaseLink(obj) && isCID(obj.cid);
};
export const isLinks = (obj) => {
    return isObject(obj)
        && Object.values(obj).every(a => isHardLink(a) || isSoftLink(a));
};
export const isUnixMeta = (obj) => {
    return isObject(obj)
        && isNum(obj.mtime)
        && isNum(obj.ctime)
        && isNum(obj.mode)
        && isString(obj._type);
};
export const isMetadata = (obj) => {
    return isObject(obj)
        && isUnixMeta(obj.unixMeta)
        && isBool(obj.isFile)
        && isSemVer(obj.version);
};
export const isSkeleton = (obj) => {
    return isObject(obj) && Object.values(obj).every(isSkeletonInfo);
};
export const isSkeletonInfo = (val) => {
    const isNode = isObject(val)
        && isCID(val.cid)
        && isCID(val.userland)
        && isCID(val.metadata)
        && isSkeleton(val.subSkeleton);
    return isNode || isSoftLink(val);
};
export const isTreeHeader = (obj) => {
    return isObject(obj)
        && isSkeleton(obj.skeleton)
        && isMetadata(obj.metadata)
        && obj.metadata.isFile === false;
};
export const isTreeInfo = (obj) => {
    return isTreeHeader(obj)
        && isCID(obj.userland);
};
export const isFileHeader = (obj) => {
    return isObject(obj)
        && isMetadata(obj.metadata)
        && obj.metadata.isFile === true;
};
export const isFileInfo = (obj) => {
    return isFileHeader(obj)
        && isCID(obj.userland);
};
export const isCID = (obj) => {
    const cid = CID.asCID(obj);
    return !!cid || isString(obj) || (obj && "code" in obj && "version" in obj && ("multihash" in obj || "hash" in obj));
};
export const isSemVer = (obj) => {
    if (!isObject(obj))
        return false;
    const { major, minor, patch } = obj;
    return isNum(major) && isNum(minor) && isNum(patch);
};
//# sourceMappingURL=check.js.map