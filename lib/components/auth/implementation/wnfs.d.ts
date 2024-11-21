import type { Components } from "../../../components.js";
import type { Dependencies } from "./base.js";
import type { Implementation } from "../implementation.js";
import * as Events from "../../../events.js";
import { Configuration } from "../../../configuration.js";
import { Maybe } from "../../../common/types.js";
import { Session } from "../../../session.js";
export declare function canDelegateAccount(dependencies: Dependencies, username: string): Promise<boolean>;
export declare function delegateAccount(dependencies: Dependencies, username: string, audience: string): Promise<Record<string, unknown>>;
export declare function linkDevice(dependencies: Dependencies, username: string, data: Record<string, unknown>): Promise<void>;
export declare function session(components: Components, authedUsername: Maybe<string>, config: Configuration, eventEmitters: {
    fileSystem: Events.Emitter<Events.FileSystem>;
    session: Events.Emitter<Events.Session<Session>>;
}): Promise<Maybe<Session>>;
export declare function isWnfsLinkingData(data: unknown): data is {
    readKey: string;
    ucan: string;
};
export declare function implementation(dependencies: Dependencies): Implementation<Components>;
