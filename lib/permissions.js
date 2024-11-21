import * as Path from "./path/index.js";
// 🏔
export const ROOT_FILESYSTEM_PERMISSIONS = {
    fs: {
        private: [Path.root()],
        public: [Path.root()]
    }
};
// 🛠
/**
 * App identifier.
 */
export function appId(app) {
    return `${app.creator}/${app.name}`;
}
/**
 * Lists the filesystems paths for a set of `Permissions`.
 * This'll return a list of `DistinctivePath`s.
 */
export function permissionPaths(permissions) {
    let list = [];
    if (permissions.app)
        list.push(Path.appData(permissions.app));
    if (permissions.fs?.private)
        list = list.concat(permissions.fs?.private.map(p => Path.withPartition("private", p)));
    if (permissions.fs?.public)
        list = list.concat(permissions.fs?.public.map(p => Path.withPartition("public", p)));
    return list;
}
//# sourceMappingURL=permissions.js.map