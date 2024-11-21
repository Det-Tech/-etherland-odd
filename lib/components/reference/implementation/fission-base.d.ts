import type { Dependencies } from "./base.js";
import type { Endpoints } from "../../../common/fission.js";
import type { Implementation } from "../implementation.js";
export declare function implementation(endpoints: Endpoints, dependencies: Dependencies): Promise<Implementation>;
