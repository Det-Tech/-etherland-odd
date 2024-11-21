export function hasProp(data, prop) {
    return typeof data === "object" && data != null && prop in data;
}
export const isDefined = (val) => {
    return val !== undefined;
};
export const notNull = (val) => {
    return val !== null;
};
export const isJust = notNull;
export const isValue = (val) => {
    return isDefined(val) && notNull(val);
};
export const isBool = (val) => {
    return typeof val === "boolean";
};
export function isCryptoKey(val) {
    return hasProp(val, "algorithm") && hasProp(val, "extractable") && hasProp(val, "type");
}
export const isNum = (val) => {
    return typeof val === "number";
};
export const isString = (val) => {
    return typeof val === "string";
};
export const isObject = (val) => {
    return val !== null && typeof val === "object";
};
export const isBlob = (val) => {
    if (typeof Blob === "undefined")
        return false;
    return val instanceof Blob || (isObject(val) && val?.constructor?.name === "Blob");
};
//# sourceMappingURL=type-checks.js.map