import type { Components } from "../../../components.js";
import type { Dependencies } from "./base.js";
import type { Implementation } from "../implementation.js";
import * as Fission from "./fission/index.js";
export declare function implementation(endpoints: Fission.Endpoints, dependencies: Dependencies): Implementation<Components>;
