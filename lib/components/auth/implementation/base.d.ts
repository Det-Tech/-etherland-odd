import * as Crypto from "../../crypto/implementation.js";
import * as Reference from "../../reference/implementation.js";
import * as Storage from "../../storage/implementation.js";
import * as Events from "../../../events.js";
import { Components } from "../../../components.js";
import { Configuration } from "../../../configuration.js";
import { Implementation } from "../implementation.js";
import { Maybe } from "../../../common/types.js";
import { Session } from "../../../session.js";
export declare const TYPE = "webCrypto";
export declare type Dependencies = {
    crypto: Crypto.Implementation;
    reference: Reference.Implementation;
    storage: Storage.Implementation;
};
export declare function canDelegateAccount(dependencies: Dependencies, username: string): Promise<boolean>;
export declare function delegateAccount(dependencies: Dependencies, username: string, audience: string): Promise<Record<string, unknown>>;
export declare function linkDevice(dependencies: Dependencies, username: string, data: Record<string, unknown>): Promise<void>;
/**
 * Doesn't quite register an account yet,
 * needs to be implemented properly by other implementations.
 *
 * NOTE: This base function should be called by other implementations,
 *       because it's the foundation for sessions.
 */
export declare function register(dependencies: Dependencies, options: {
    username: string;
    email: string;
    code: string;
    hashedUsername: string;
    type?: string;
}): Promise<{
    success: boolean;
}>;
export declare function emailVerify(dependencies: Dependencies, options: {
    email: string;
    type?: string;
}): Promise<{
    success: boolean;
}>;
export declare function session(components: Components, authedUsername: Maybe<string>, config: Configuration, eventEmitters: {
    session: Events.Emitter<Events.Session<Session>>;
}): Promise<Maybe<Session>>;
export declare function implementation(dependencies: Dependencies): Implementation<Components>;
