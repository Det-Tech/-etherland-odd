import { isString } from "./common/type-checks.js";
import { appId, ROOT_FILESYSTEM_PERMISSIONS } from "./permissions.js";
// 🛠
export function addRootFileSystemPermissions(config) {
    return { ...config, permissions: { ...config.permissions, ...ROOT_FILESYSTEM_PERMISSIONS } };
}
/**
 * Generate a namespace string based on a configuration.
 */
export function namespace(config) {
    return isString(config.namespace) ? config.namespace : appId(config.namespace);
}
//# sourceMappingURL=configuration.js.map