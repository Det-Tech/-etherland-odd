import * as Did from "../../../did/index.js";
import * as SessionMod from "../../../session.js";
import * as Ucan from "../../../ucan/index.js";
import { Session } from "../../../session.js";
// 🏔
export const TYPE = "webCrypto";
// 🛠
export async function canDelegateAccount(dependencies, username) {
    const didFromDNS = await dependencies.reference.didRoot.lookup(username);
    const maybeUcan = await dependencies.storage.getItem(dependencies.storage.KEYS.ACCOUNT_UCAN);
    if (maybeUcan) {
        const rootIssuerDid = Ucan.rootIssuer(maybeUcan);
        const decodedUcan = Ucan.decode(maybeUcan);
        const { ptc } = decodedUcan.payload;
        return didFromDNS === rootIssuerDid && ptc === "SUPER_USER";
    }
    else {
        const rootDid = await Did.write(dependencies.crypto);
        return didFromDNS === rootDid;
    }
}
export async function delegateAccount(dependencies, username, audience) {
    const proof = await dependencies.storage.getItem(dependencies.storage.KEYS.ACCOUNT_UCAN) ?? undefined;
    // UCAN
    const u = await Ucan.build({
        dependencies,
        audience,
        issuer: await Did.write(dependencies.crypto),
        lifetimeInSeconds: 60 * 60 * 24 * 30 * 12 * 1000,
        potency: "SUPER_USER",
        proof,
        // TODO: UCAN v0.7.0
        // proofs: [ await localforage.getItem(dependencies.storage.KEYS.ACCOUNT_UCAN) ]
    });
    return { token: Ucan.encode(u) };
}
export async function linkDevice(dependencies, username, data) {
    const { token } = data;
    const u = Ucan.decode(token);
    if (await Ucan.isValid(dependencies.crypto, u)) {
        await dependencies.storage.setItem(dependencies.storage.KEYS.ACCOUNT_UCAN, token);
        await SessionMod.provide(dependencies.storage, { type: TYPE, username });
    }
}
/**
 * Doesn't quite register an account yet,
 * needs to be implemented properly by other implementations.
 *
 * NOTE: This base function should be called by other implementations,
 *       because it's the foundation for sessions.
 */
export async function register(dependencies, options) {
    await SessionMod.provide(dependencies.storage, { type: options.type || TYPE, username: options.username });
    return { success: true };
}
export async function session(components, authedUsername, config, eventEmitters) {
    if (authedUsername) {
        const session = new Session({
            crypto: components.crypto,
            storage: components.storage,
            eventEmitter: eventEmitters.session,
            type: TYPE,
            username: authedUsername
        });
        return session;
    }
    else {
        return null;
    }
}
// 🛳
export function implementation(dependencies) {
    return {
        type: TYPE,
        canDelegateAccount: (...args) => canDelegateAccount(dependencies, ...args),
        delegateAccount: (...args) => delegateAccount(dependencies, ...args),
        linkDevice: (...args) => linkDevice(dependencies, ...args),
        register: (...args) => register(dependencies, ...args),
        session: session,
        // Have to be implemented properly by other implementations
        createChannel: () => { throw new Error("Not implemented"); },
        isUsernameValid: () => { throw new Error("Not implemented"); },
        isUsernameAvailable: () => { throw new Error("Not implemented"); },
    };
}
//# sourceMappingURL=base.js.map