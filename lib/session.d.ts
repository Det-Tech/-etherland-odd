import * as Crypto from "./components/crypto/implementation.js";
import * as Storage from "./components/storage/implementation.js";
import * as Events from "./events.js";
import { Maybe } from "./common/types.js";
import FileSystem from "./fs/index.js";
export declare class Session {
    #private;
    fs?: FileSystem;
    type: string;
    username: string;
    constructor(props: {
        crypto: Crypto.Implementation;
        storage: Storage.Implementation;
        eventEmitter: Events.Emitter<Events.Session<Session>>;
        fs?: FileSystem;
        type: string;
        username: string;
    });
    destroy(): Promise<void>;
}
declare type SessionInfo = {
    type: string;
    username: string;
};
export declare function isSessionInfo(a: unknown): a is SessionInfo;
/**
 * Begin to restore a `Session` by looking up the `SessionInfo` in the storage.
 */
export declare function restore(storage: Storage.Implementation): Promise<Maybe<SessionInfo>>;
/**
 * Prepare the system for the creation of a `Session`
 * by adding the necessary info to the storage.
 */
export declare function provide(storage: Storage.Implementation, info: SessionInfo): Promise<string>;
export {};
