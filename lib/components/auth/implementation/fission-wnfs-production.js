import * as FissionWnfs from "./fission-wnfs.js";
import * as FissionEndpoints from "../../../common/fission.js";
export function implementation(dependencies) {
    return FissionWnfs.implementation(FissionEndpoints.PRODUCTION, dependencies);
}
//# sourceMappingURL=fission-wnfs-production.js.map