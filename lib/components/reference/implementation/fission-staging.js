import * as FissionBase from "./fission-base.js";
import * as FissionEndpoints from "../../../common/fission.js";
export function implementation(dependencies) {
    return FissionBase.implementation(FissionEndpoints.STAGING, dependencies);
}
//# sourceMappingURL=fission-staging.js.map