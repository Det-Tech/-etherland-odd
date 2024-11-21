import * as Path from "../path/index.js";
import * as Ucan from "../ucan/index.js";
import Repository from "../repository.js";
export function create({ storage }) {
    return Repo.create({
        storage,
        storageName: storage.KEYS.UCANS
    });
}
// CLASS
export class Repo extends Repository {
    constructor(options) {
        super(options);
    }
    // ENCODING
    fromJSON(a) { return Ucan.decode(a); }
    toJSON(a) { return Ucan.encode(a); }
    // `${resourceKey}:${resourceValue}`
    toDictionary(items) {
        return items.reduce((acc, ucan) => ({ ...acc, [resourceLabel(ucan.payload.rsc)]: ucan }), {});
    }
    // LOOKUPS
    /**
     * Look up a UCAN with a file system path.
     */
    async lookupFilesystemUcan(path) {
        const god = this.getByKey("*");
        if (god)
            return god;
        const all = path === "*";
        const isDirectory = all ? false : Path.isDirectory(path);
        const pathParts = all ? ["*"] : Path.unwrap(path);
        const prefix = filesystemPrefix();
        return pathParts.reduce((acc, part, idx) => {
            if (acc)
                return acc;
            const isLastPart = idx === 0;
            const partsSlice = pathParts.slice(0, pathParts.length - idx);
            const partialPath = Path.toPosix(isLastPart && !isDirectory
                ? Path.file(...partsSlice)
                : Path.directory(...partsSlice));
            return this.getByKey(`${prefix}${partialPath}`) || null;
        }, null);
    }
    /**
     * Look up a UCAN for a platform app.
     */
    async lookupAppUcan(domain) {
        return this.getByKey("*") || this.getByKey("app:*") || this.getByKey(`app:${domain}`);
    }
}
// CONSTANTS
// TODO: Waiting on API change.
//       Should be `dnslink`
export const WNFS_PREFIX = "wnfs";
// DICTIONARY
/**
 * Construct the prefix for a filesystem key.
 */
export function filesystemPrefix(username) {
    // const host = `${username}.${setup.endpoints.user}`
    // TODO: Waiting on API change.
    //       Should be `${WNFS_PREFIX}:${host}/`
    return WNFS_PREFIX + ":";
}
/**
 * Creates the label for a given resource.
 */
export function resourceLabel(rsc) {
    if (typeof rsc !== "object") {
        return rsc;
    }
    const resource = Array.from(Object.entries(rsc))[0];
    return resource[0] + ":" + (resource[0] === WNFS_PREFIX
        ? resource[1].replace(/^\/+/, "")
        : resource[1]);
}
//# sourceMappingURL=ucans.js.map