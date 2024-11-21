import * as Base from "./base.js";
import * as DataRoot from "./fission/data-root.js";
import * as DID from "./fission/did.js";
// 🛳
export async function implementation(endpoints, dependencies) {
    const base = await Base.implementation(dependencies);
    base.dataRoot.domain = (username) => `${username}.files.${endpoints.userDomain}`;
    base.dataRoot.lookup = (...args) => DataRoot.lookup(endpoints, dependencies, ...args);
    base.dataRoot.update = (...args) => DataRoot.update(endpoints, dependencies, ...args);
    base.didRoot.lookup = (...args) => DID.root(endpoints, ...args);
    return base;
}
//# sourceMappingURL=fission-base.js.map