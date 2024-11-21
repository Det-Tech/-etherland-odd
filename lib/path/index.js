export var RootBranch;
(function (RootBranch) {
    RootBranch["Public"] = "public";
    RootBranch["Pretty"] = "p";
    RootBranch["Private"] = "private";
    RootBranch["PrivateLog"] = "privateLog";
    RootBranch["Shared"] = "shared";
    RootBranch["SharedCounter"] = "sharedCounter";
    RootBranch["Version"] = "version";
})(RootBranch || (RootBranch = {}));
export var Kind;
(function (Kind) {
    Kind["Directory"] = "directory";
    Kind["File"] = "file";
})(Kind || (Kind = {}));
export function directory(...args) {
    if (args.some(p => p.includes("/"))) {
        throw new Error("Forward slashes `/` are not allowed");
    }
    return { directory: args };
}
export function file(...args) {
    if (args.some(p => p.includes("/"))) {
        throw new Error("Forward slashes `/` are not allowed");
    }
    return { file: args };
}
/**
 * Utility function to create a root `DirectoryPath`
 */
export function root() {
    return { directory: [] };
}
export function appData(app, suffix) {
    const appDir = directory(RootBranch.Private, "Apps", app.creator, app.name);
    return suffix ? combine(appDir, suffix) : appDir;
}
// POSIX
/**
 * Transform a string into a `DistinctivePath`.
 *
 * Directories should have the format `path/to/dir/` and
 * files should have the format `path/to/file`.
 *
 * Leading forward slashes are removed too, so you can pass absolute paths.
 */
export function fromPosix(path) {
    const split = path.replace(/^\/+/, "").split("/");
    if (path.endsWith("/"))
        return { directory: split.slice(0, -1) };
    else if (path === "")
        return root();
    return { file: split };
}
/**
 * Transform a `DistinctivePath` into a string.
 *
 * Directories will have the format `path/to/dir/` and
 * files will have the format `path/to/file`.
 */
export function toPosix(path, { absolute } = { absolute: false }) {
    const prefix = absolute ? "/" : "";
    const joinedPath = unwrap(path).join("/");
    if (isDirectory(path))
        return prefix + joinedPath + (joinedPath.length ? "/" : "");
    return prefix + joinedPath;
}
export function combine(a, b) {
    return map(p => unwrap(a).concat(p), b);
}
/**
 * Is this `DistinctivePath` a directory?
 */
export function isDirectory(path) {
    return !!path.directory;
}
/**
 * Is this `DistinctivePath` a file?
 */
export function isFile(path) {
    return !!path.file;
}
/**
 * Is this `DistinctivePath` of the given `Partition`?
 */
export function isPartition(partition, path) {
    return unwrap(path)[0] === partition;
}
/**
 * Is this `DistinctivePath` on the given `RootBranch`?
 */
export function isOnRootBranch(rootBranch, path) {
    return unwrap(path)[0] === rootBranch;
}
/**
 * Is this `DirectoryPath` a root directory?
 */
export function isRootDirectory(path) {
    return path.directory.length === 0;
}
/**
 * Check if two `DistinctivePath` have the same `Partition`.
 */
export function isSamePartition(a, b) {
    return unwrap(a)[0] === unwrap(b)[0];
}
/**
 * Check if two `DistinctivePath` are of the same kind.
 */
export function isSameKind(a, b) {
    if (isDirectory(a) && isDirectory(b))
        return true;
    else if (isFile(a) && isFile(b))
        return true;
    else
        return false;
}
/**
 * What `Kind` of path are we dealing with?
 */
export function kind(path) {
    if (isDirectory(path))
        return Kind.Directory;
    return Kind.File;
}
/**
 * Map a `DistinctivePath`.
 */
export function map(fn, path) {
    if (isDirectory(path))
        return { directory: fn(path.directory) };
    else if (isFile(path))
        return { file: fn(path.file) };
    return path;
}
export function parent(path) {
    return isDirectory(path) && isRootDirectory(path)
        ? null
        : directory(...unwrap(path).slice(0, -1));
}
/**
 * Remove the `Partition` of a `DistinctivePath` (ie. the top-level directory)
 */
export function removePartition(path) {
    return map(p => isDirectory(path) || p.length > 1 ? p.slice(1) : p, path);
}
/**
 * Get the last part of the path.
 */
export function terminus(path) {
    const u = unwrap(path);
    if (u.length < 1)
        return null;
    return u[u.length - 1];
}
/**
 * Unwrap a `DistinctivePath`.
 */
export function unwrap(path) {
    if (isDirectory(path)) {
        return path.directory;
    }
    else if (isFile(path)) {
        return path.file;
    }
    throw new Error("Path is neither a directory or a file");
}
export function withPartition(partition, path) {
    return combine(directory(partition), path);
}
// ⚗️
/**
 * Render a raw `Path` to a string for logging purposes.
 */
export function log(path) {
    return `[ ${path.join(", ")} ]`;
}
//# sourceMappingURL=index.js.map