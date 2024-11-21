import * as Capabilities from "../../../capabilities.js";
import * as Crypto from "../../../components/crypto/implementation.js";
import * as Fission from "../../../common/fission.js";
import { Implementation, RequestOptions } from "../implementation.js";
import { Maybe } from "../../../common/types.js";
export declare type Dependencies = {
    crypto: Crypto.Implementation;
};
export declare function collect(endpoints: Fission.Endpoints, dependencies: Dependencies): Promise<Maybe<Capabilities.Capabilities>>;
/**
 * Redirects to a lobby.
 *
 * NOTE: Only works on the main thread, as it uses `window.location`.
 */
export declare function request(endpoints: Fission.Endpoints, dependencies: Dependencies, options?: RequestOptions): Promise<void>;
export declare function implementation(endpoints: Fission.Endpoints, dependencies: Dependencies): Implementation;
