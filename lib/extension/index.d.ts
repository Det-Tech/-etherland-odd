import type { AppInfo } from "../appInfo.js";
import type { Crypto, Reference } from "../components.js";
import type { Maybe } from "../common/types.js";
import type { Permissions } from "../permissions.js";
import type { Session } from "../session.js";
import * as Events from "../events.js";
export declare type Dependencies = {
    crypto: Crypto.Implementation;
    reference: Reference.Implementation;
};
declare type Config = {
    namespace: AppInfo | string;
    session: Maybe<Session>;
    capabilities?: Permissions;
    dependencies: Dependencies;
    eventEmitters: {
        fileSystem: Events.Emitter<Events.FileSystem>;
        session: Events.Emitter<Events.Session<Session>>;
    };
};
export declare function create(config: Config): Promise<{
    connect: (extensionId: string) => void;
    disconnect: (extensionId: string) => void;
}>;
export {};
