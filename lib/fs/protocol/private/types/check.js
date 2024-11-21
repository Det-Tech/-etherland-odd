import * as check from "../../../types/check.js";
import { isNum, isObject, isString, notNull } from "../../../../common/index.js";
export const isDecryptedNode = (obj) => {
    return isPrivateTreeInfo(obj) || isPrivateFileInfo(obj) || check.isSoftLink(obj);
};
export const isPrivateFileInfo = (obj) => {
    return isObject(obj)
        && check.isMetadata(obj.metadata)
        && obj.metadata.isFile
        && isString(obj.key)
        && notNull(obj.content);
};
export const isPrivateTreeInfo = (obj) => {
    return isObject(obj)
        && check.isMetadata(obj.metadata)
        && obj.metadata.isFile === false
        && isNum(obj.revision)
        && isPrivateLinks(obj.links)
        && isPrivateSkeleton(obj.skeleton);
};
export const isPrivateLink = (obj) => {
    return check.isBaseLink(obj)
        && isString(obj.key)
        && isString(obj.pointer);
};
export const isPrivateLinks = (obj) => {
    return isObject(obj)
        && Object.values(obj).every(a => isPrivateLink(a) || check.isSoftLink(a));
};
export const isPrivateSkeleton = (obj) => {
    return isObject(obj)
        && Object.values(obj).every(a => isPrivateSkeletonInfo(a) || check.isSoftLink(a));
};
export const isPrivateSkeletonInfo = (obj) => {
    return isObject(obj)
        && notNull(obj.cid)
        && isString(obj.key)
        && isPrivateSkeleton(obj.subSkeleton);
};
//# sourceMappingURL=check.js.map