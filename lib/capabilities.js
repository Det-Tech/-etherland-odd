/**
 * Filesystem UCANs, read keys and namefilters,
 * attained from elsewhere in confidence.
 */
import * as Identifiers from "./common/identifiers.js";
import * as Path from "./path/index.js";
import * as Permissions from "./permissions.js";
import * as UcansRepo from "./repositories/ucans.js";
import * as Ucan from "./ucan/index.js";
// 🏔
export const SESSION_TYPE = "capabilities";
// 🛠
export async function collect({ capabilities, crypto, reference, storage }) {
    if (capabilities.ucans.length === 0)
        throw new Error("Expected at least one UCAN");
    await collectPermissions({ reference, ucans: capabilities.ucans });
    const accountDID = await reference.didRoot.lookup(capabilities.username);
    await capabilities.fileSystemSecrets.reduce(async (acc, fsSecret) => {
        await acc;
        await collectSecret({
            accountDID,
            crypto,
            storage,
            bareNameFilter: fsSecret.bareNameFilter,
            readKey: fsSecret.readKey,
            path: fsSecret.path,
        });
    }, Promise.resolve());
}
export async function collectSecret({ accountDID, bareNameFilter, crypto, path, readKey, storage }) {
    const readKeyId = await Identifiers.readKey({ accountDID, crypto, path });
    const bareNameFilterId = await Identifiers.bareNameFilter({ accountDID, crypto, path });
    await crypto.keystore.importSymmKey(readKey, readKeyId);
    await storage.setItem(bareNameFilterId, bareNameFilter);
}
export async function collectPermissions({ reference, ucans }) {
    await reference.repositories.ucans.add(ucans);
}
/**
 * See if the stored UCANs in a repository
 * conform to the given `Permissions`.
 *
 * This returns the last encountered valid UCAN.
 */
export function validatePermissions(repo, { app, fs, raw }) {
    let ucan;
    const prefix = UcansRepo.filesystemPrefix();
    // Root access
    const rootUcan = repo.getByKey("*");
    if (rootUcan && !Ucan.isExpired(rootUcan) && !Ucan.isSelfSigned(rootUcan))
        return rootUcan;
    // Check permissions
    if (app) {
        const k = prefix + Path.toPosix(Path.appData(app));
        const u = repo.getByKey(k);
        if (!u || Ucan.isExpired(u))
            return null;
        ucan = u;
    }
    if (fs?.private) {
        const priv = fs.private.every(path => {
            const pathWithPrefix = `${prefix}private/` + Path.toPosix(path);
            const u = repo.getByKey(pathWithPrefix);
            ucan = u;
            return u && !Ucan.isExpired(u);
        });
        if (!priv)
            return null;
    }
    if (fs?.public) {
        const publ = fs.public.every(path => {
            const pathWithPrefix = `${prefix}public/` + Path.toPosix(path);
            const u = repo.getByKey(pathWithPrefix);
            ucan = u;
            return u && !Ucan.isExpired(u);
        });
        if (!publ)
            return null;
    }
    if (raw) {
        const hasRaw = raw.every(r => {
            const label = UcansRepo.resourceLabel(r.rsc);
            const u = repo.getByKey(label);
            ucan = u;
            return u && !Ucan.isExpired(u);
        });
        if (!hasRaw)
            return null;
    }
    return ucan || null;
}
/**
 * Ensure the existence and validity of the read keys and namefilters
 * we need for the filesystem based on the permissions we asked for.
 */
export async function validateSecrets(crypto, accountDID, permissions) {
    return Permissions.permissionPaths(permissions).reduce((acc, path) => acc.then(async (bool) => {
        if (bool === false)
            return bool;
        if (Path.isPartition(Path.RootBranch.Public, path))
            return bool;
        const keyName = await Identifiers.readKey({ accountDID, crypto, path });
        return crypto.keystore.keyExists(keyName);
    }), Promise.resolve(true));
}
//# sourceMappingURL=capabilities.js.map