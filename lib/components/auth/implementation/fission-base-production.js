import * as FissionBase from "./fission-base.js";
import * as FissionEndpoints from "../../../common/fission.js";
export function implementation(dependencies) {
    return FissionBase.implementation(FissionEndpoints.PRODUCTION, dependencies);
}
//# sourceMappingURL=fission-base-production.js.map