export var UnixNodeType;
(function (UnixNodeType) {
    UnixNodeType["Raw"] = "raw";
    UnixNodeType["Directory"] = "dir";
    UnixNodeType["File"] = "file";
    UnixNodeType["Metadata"] = "metadata";
    UnixNodeType["Symlink"] = "symlink";
    UnixNodeType["HAMTShard"] = "hamtShard";
})(UnixNodeType || (UnixNodeType = {}));
export const emptyUnix = (isFile) => ({
    mtime: Date.now(),
    ctime: Date.now(),
    mode: isFile ? 644 : 755,
    _type: isFile ? UnixNodeType.File : UnixNodeType.Directory,
});
export const empty = (isFile, version) => ({
    isFile,
    version,
    unixMeta: emptyUnix(isFile)
});
export const updateMtime = (metadata) => ({
    ...metadata,
    unixMeta: {
        ...metadata.unixMeta,
        mtime: Date.now()
    }
});
//# sourceMappingURL=metadata.js.map