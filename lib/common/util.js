export const removeKeyFromObj = (obj, key) => {
    const { [key]: omit, ...rest } = obj; // eslint-disable-line
    return rest;
};
export const updateOrRemoveKeyFromObj = (obj, key, val) => (val === null
    ? removeKeyFromObj(obj, key)
    : {
        ...obj,
        [key]: val
    });
export const mapObj = (obj, fn) => {
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
        newObj[key] = fn(value, key);
    });
    return newObj;
};
export const mapObjAsync = async (obj, fn) => {
    const newObj = {};
    await Promise.all(Object.entries(obj).map(async ([key, value]) => {
        newObj[key] = await fn(value, key);
    }));
    return newObj;
};
export const arrContains = (arr, val) => {
    return arr.indexOf(val) > -1;
};
export const asyncWaterfall = async (val, operations) => {
    let acc = val;
    for (let i = 0; i < operations.length; i++) {
        acc = await operations[i](acc);
    }
    return acc;
};
//# sourceMappingURL=util.js.map