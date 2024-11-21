var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Session_crypto, _Session_storage, _Session_eventEmitter;
import * as TypeChecks from "./common/type-checks.js";
// ✨
export class Session {
    constructor(props) {
        _Session_crypto.set(this, void 0);
        _Session_storage.set(this, void 0);
        _Session_eventEmitter.set(this, void 0);
        __classPrivateFieldSet(this, _Session_crypto, props.crypto, "f");
        __classPrivateFieldSet(this, _Session_storage, props.storage, "f");
        __classPrivateFieldSet(this, _Session_eventEmitter, props.eventEmitter, "f");
        this.fs = props.fs;
        this.type = props.type;
        this.username = props.username;
        __classPrivateFieldGet(this, _Session_eventEmitter, "f").emit("session:create", { session: this });
    }
    async destroy() {
        __classPrivateFieldGet(this, _Session_eventEmitter, "f").emit("session:destroy", { username: this.username });
        await __classPrivateFieldGet(this, _Session_storage, "f").removeItem(__classPrivateFieldGet(this, _Session_storage, "f").KEYS.ACCOUNT_UCAN);
        await __classPrivateFieldGet(this, _Session_storage, "f").removeItem(__classPrivateFieldGet(this, _Session_storage, "f").KEYS.CID_LOG);
        await __classPrivateFieldGet(this, _Session_storage, "f").removeItem(__classPrivateFieldGet(this, _Session_storage, "f").KEYS.SESSION);
        await __classPrivateFieldGet(this, _Session_storage, "f").removeItem(__classPrivateFieldGet(this, _Session_storage, "f").KEYS.UCANS);
        await __classPrivateFieldGet(this, _Session_crypto, "f").keystore.clearStore();
        if (this.fs)
            this.fs.deactivate();
    }
}
_Session_crypto = new WeakMap(), _Session_storage = new WeakMap(), _Session_eventEmitter = new WeakMap();
export function isSessionInfo(a) {
    return TypeChecks.isObject(a)
        && TypeChecks.hasProp(a, "username")
        && TypeChecks.hasProp(a, "type");
}
/**
 * Begin to restore a `Session` by looking up the `SessionInfo` in the storage.
 */
export async function restore(storage) {
    return storage
        .getItem(storage.KEYS.SESSION)
        .then((a) => a ? a : null)
        .then(a => a ? JSON.parse(a) : null)
        .then(a => isSessionInfo(a) ? a : null);
}
/**
 * Prepare the system for the creation of a `Session`
 * by adding the necessary info to the storage.
 */
export function provide(storage, info) {
    return storage.setItem(storage.KEYS.SESSION, JSON.stringify({ type: info.type, username: info.username }));
}
//# sourceMappingURL=session.js.map