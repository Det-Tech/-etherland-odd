import * as FissionEndpoints from "../../../common/fission.js";
import * as IPFS from "./ipfs-default-pkg.js";
// 🛳
export async function implementation(dependencies, repoName) {
    return IPFS.implementation(dependencies, FissionEndpoints.STAGING.server + "/ipfs/peers", repoName);
}
//# sourceMappingURL=fission-ipfs-staging.js.map