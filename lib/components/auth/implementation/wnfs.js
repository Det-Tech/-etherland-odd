import * as Uint8arrays from "uint8arrays";
import * as Base from "./base.js";
import * as DID from "../../../did/index.js";
import * as RootKey from "../../../common/root-key.js";
import * as SessionMod from "../../../session.js";
import * as TypeChecks from "../../../common/type-checks.js";
import * as Ucan from "../../../ucan/index.js";
import { LinkingError } from "../../../linking/common.js";
import { Session } from "../../../session.js";
import { loadFileSystem } from "../../../filesystem.js";
export async function canDelegateAccount(dependencies, username) {
    const accountDID = await dependencies.reference.didRoot.lookup(username);
    const readKey = await RootKey.retrieve({ crypto: dependencies.crypto, accountDID });
    if (!readKey)
        return false;
    return Base.canDelegateAccount(dependencies, username);
}
export async function delegateAccount(dependencies, username, audience) {
    const accountDID = await dependencies.reference.didRoot.lookup(username);
    const readKey = await RootKey.retrieve({ crypto: dependencies.crypto, accountDID });
    const { token } = await Base.delegateAccount(dependencies, username, audience);
    return { readKey: Uint8arrays.toString(readKey, "base64pad"), ucan: token };
}
export async function linkDevice(dependencies, username, data) {
    if (!isWnfsLinkingData(data)) {
        throw new LinkingError(`Consumer received invalid link device response from producer: Expected read key and ucan, but got ${JSON.stringify(data)}`);
    }
    const { readKey, ucan: encodedToken } = data;
    const ucan = Ucan.decode(encodedToken);
    if (await Ucan.isValid(dependencies.crypto, ucan)) {
        await dependencies.storage.setItem(dependencies.storage.KEYS.ACCOUNT_UCAN, encodedToken);
        await RootKey.store({
            accountDID: await dependencies.reference.didRoot.lookup(username),
            crypto: dependencies.crypto,
            readKey: RootKey.fromString(readKey)
        });
        // Create and store filesystem UCAN
        const issuer = await DID.write(dependencies.crypto);
        const fsUcan = await Ucan.build({
            dependencies: dependencies,
            potency: "APPEND",
            resource: "*",
            proof: encodedToken,
            lifetimeInSeconds: 60 * 60 * 24 * 30 * 12 * 1000,
            audience: issuer,
            issuer
        });
        await dependencies.reference.repositories.ucans.add(fsUcan);
    }
    else {
        throw new LinkingError(`Consumer received invalid link device response from producer. Given ucan is invalid: ${data.ucan}`);
    }
    await SessionMod.provide(dependencies.storage, { type: Base.TYPE, username });
}
export async function session(components, authedUsername, config, eventEmitters) {
    if (authedUsername) {
        // Self-authorize a filesystem UCAN if needed
        const hasSelfAuthorisedFsUcan = components.reference.repositories.ucans.find(ucan => {
            // 🛑 If the UCAN expires within a week
            if (ucan.payload.exp < (Date.now() + 60 * 60 * 24 * 7))
                return false;
            // Check potency and resource
            return ucan.payload.ptc === "APPEND" && ucan.payload.rsc === "*";
        });
        if (!hasSelfAuthorisedFsUcan) {
            const issuer = await DID.write(components.crypto);
            const proof = await components.storage.getItem(components.storage.KEYS.ACCOUNT_UCAN);
            const fsUcan = await Ucan.build({
                dependencies: components,
                potency: "APPEND",
                resource: "*",
                proof: proof ? proof : undefined,
                lifetimeInSeconds: 60 * 60 * 24 * 30 * 12 * 1000,
                audience: issuer,
                issuer
            });
            await components.reference.repositories.ucans.add(fsUcan);
        }
        // Load filesystem
        const fs = config.fileSystem?.loadImmediately === false ?
            undefined :
            await loadFileSystem({
                config,
                dependencies: {
                    crypto: components.crypto,
                    depot: components.depot,
                    manners: components.manners,
                    reference: components.reference,
                    storage: components.storage,
                },
                eventEmitter: eventEmitters.fileSystem,
                username: authedUsername,
            });
        const session = new Session({
            crypto: components.crypto,
            fs: fs,
            eventEmitter: eventEmitters.session,
            storage: components.storage,
            type: Base.TYPE,
            username: authedUsername
        });
        // Fin
        return session;
    }
    return null;
}
// 🛠
export function isWnfsLinkingData(data) {
    return TypeChecks.isObject(data)
        && "readKey" in data && typeof data.readKey === "string"
        && "ucan" in data && typeof data.ucan === "string";
}
// 🛳
export function implementation(dependencies) {
    const base = Base.implementation(dependencies);
    return {
        type: base.type,
        session,
        canDelegateAccount: (...args) => canDelegateAccount(dependencies, ...args),
        delegateAccount: (...args) => delegateAccount(dependencies, ...args),
        linkDevice: (...args) => linkDevice(dependencies, ...args),
        // Have to be implemented properly by other implementations
        createChannel: base.createChannel,
        isUsernameValid: base.isUsernameValid,
        isUsernameAvailable: base.isUsernameAvailable,
        register: base.register,
        emailVerify: base.emailVerify,
    };
}
//# sourceMappingURL=wnfs.js.map