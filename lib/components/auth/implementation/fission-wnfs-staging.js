import * as FissionWnfs from "./fission-wnfs.js";
import * as FissionEndpoints from "../../../common/fission.js";
export function implementation(dependencies) {
    return FissionWnfs.implementation(FissionEndpoints.STAGING, dependencies);
}
//# sourceMappingURL=fission-wnfs-staging.js.map