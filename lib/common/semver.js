// TYPES
// FUNCTIONS
export const encode = (major, minor, patch) => {
    return {
        major,
        minor,
        patch
    };
};
export const fromString = (str) => {
    const parts = str.split(".").map(x => parseInt(x)); // dont shorten this because parseInt has a second param
    if (parts.length !== 3 || parts.some(p => typeof p !== "number")) {
        return null;
    }
    return {
        major: parts[0],
        minor: parts[1],
        patch: parts[2]
    };
};
export const toString = (version) => {
    const { major, minor, patch } = version;
    return `${major}.${minor}.${patch}`;
};
export const equals = (a, b) => {
    return a.major === b.major
        && a.minor === b.minor
        && a.patch === b.patch;
};
export const isSmallerThan = (a, b) => {
    if (a.major != b.major)
        return a.major < b.major;
    if (a.minor != b.minor)
        return a.minor < b.minor;
    return a.patch < b.patch;
};
export const isBiggerThan = (a, b) => {
    return isSmallerThan(b, a);
};
export function isBiggerThanOrEqualTo(a, b) {
    return isSmallerThan(b, a) || equals(a, b);
}
//# sourceMappingURL=semver.js.map