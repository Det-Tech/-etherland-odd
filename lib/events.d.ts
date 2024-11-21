import { CID } from "./common/cid.js";
import { EventEmitter } from "./common/event-emitter.js";
import { DistinctivePath, Partition, Partitioned } from "./path/index.js";
export { EventEmitter, EventEmitter as Emitter };
/**
 * Events interface.
 *
 * Subscribe to events using `on` and unsubscribe using `off`,
 * alternatively you can use `addListener` and `removeListener`.
 *
 * ```ts
 * program.on("fileSystem:local-change", ({ path, root }) => {
 *   console.log("The file system has changed locally 🔔")
 *   console.log("Changed path:", path)
 *   console.log("New data root CID:", root)
 * })
 *
 * program.off("fileSystem:publish")
 * ```
 */
export declare type ListenTo<EventMap> = Pick<EventEmitter<EventMap>, "addListener" | "removeListener" | "on" | "off">;
export declare type FileSystem = {
    "fileSystem:local-change": {
        root: CID;
        path: DistinctivePath<Partitioned<Partition>>;
    };
    "fileSystem:publish": {
        root: CID;
    };
};
export declare type Session<S> = {
    "session:create": {
        session: S;
    };
    "session:destroy": {
        username: string;
    };
};
export declare type All<S> = FileSystem & Session<S>;
export declare function createEmitter<EventMap>(): EventEmitter<EventMap>;
export declare function listenTo<EventMap>(emitter: EventEmitter<EventMap>): ListenTo<EventMap>;
export declare function merge<A, B>(a: EventEmitter<A>, b: EventEmitter<B>): EventEmitter<A & B>;
