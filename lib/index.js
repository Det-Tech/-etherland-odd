/*

    %@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%
@@@@@%     %@@@@@@%         %@@@@@@@%     %@@@@@
@@@@@       @@@@@%            @@@@@@       @@@@@
@@@@@%      @@@@@             %@@@@@      %@@@@@
@@@@@@%     @@@@@     %@@%     @@@@@     %@@@@@@
@@@@@@@     @@@@@    %@@@@%    @@@@@     @@@@@@@
@@@@@@@     @@@@%    @@@@@@    @@@@@     @@@@@@@
@@@@@@@    %@@@@     @@@@@@    @@@@@%    @@@@@@@
@@@@@@@    @@@@@     @@@@@@    %@@@@@    @@@@@@@
@@@@@@@    @@@@@@@@@@@@@@@@     @@@@@    @@@@@@@
@@@@@@@    %@@@@@@@@@@@@@@@     @@@@%    @@@@@@@
@@@@@@@     %@@%     @@@@@@     %@@%     @@@@@@@
@@@@@@@              @@@@@@              @@@@@@@
@@@@@@@%            %@@@@@@%            %@@@@@@@
@@@@@@@@@%        %@@@@@@@@@@%        %@@@@@@@@@
%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    %@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%

 */
import * as Uint8arrays from "uint8arrays";
import localforage from "localforage";
import * as Capabilities from "./capabilities.js";
import * as DID from "./did/local.js";
import * as Events from "./events.js";
import * as Extension from "./extension/index.js";
import * as FileSystemData from "./fs/data.js";
import * as RootKey from "./common/root-key.js";
import * as Semver from "./common/semver.js";
import * as SessionMod from "./session.js";
import * as Ucan from "./ucan/index.js";
import { SESSION_TYPE as CAPABILITIES_SESSION_TYPE } from "./capabilities.js";
import { TYPE as WEB_CRYPTO_SESSION_TYPE } from "./components/auth/implementation/base.js";
import { VERSION } from "./common/version.js";
import { createConsumer, createProducer } from "./linking/index.js";
import { namespace } from "./configuration.js";
import { isString } from "./common/index.js";
import { Session } from "./session.js";
import { loadFileSystem, recoverFileSystem } from "./filesystem.js";
import * as BrowserCrypto from "./components/crypto/implementation/browser.js";
import * as BrowserStorage from "./components/storage/implementation/browser.js";
import * as FissionIpfsProduction from "./components/depot/implementation/fission-ipfs-production.js";
import * as FissionIpfsStaging from "./components/depot/implementation/fission-ipfs-staging.js";
import * as FissionAuthBaseProduction from "./components/auth/implementation/fission-base-production.js";
import * as FissionAuthBaseStaging from "./components/auth/implementation/fission-base-staging.js";
import * as FissionAuthWnfsProduction from "./components/auth/implementation/fission-wnfs-production.js";
import * as FissionAuthWnfsStaging from "./components/auth/implementation/fission-wnfs-staging.js";
import * as FissionLobbyProduction from "./components/capabilities/implementation/fission-lobby-production.js";
import * as FissionLobbyStaging from "./components/capabilities/implementation/fission-lobby-staging.js";
import * as FissionReferenceProduction from "./components/reference/implementation/fission-production.js";
import * as FissionReferenceStaging from "./components/reference/implementation/fission-staging.js";
import * as MemoryStorage from "./components/storage/implementation/memory.js";
import * as ProperManners from "./components/manners/implementation/base.js";
// RE-EXPORTS
export * from "./appInfo.js";
export * from "./components.js";
export * from "./configuration.js";
export * from "./common/cid.js";
export * from "./common/types.js";
export * from "./common/version.js";
export * from "./permissions.js";
export * as apps from "./apps/index.js";
export * as did from "./did/index.js";
export * as fission from "./common/fission.js";
export * as path from "./path/index.js";
export * as ucan from "./ucan/index.js";
export { FileSystem } from "./fs/filesystem.js";
export { Session } from "./session.js";
export var ProgramError;
(function (ProgramError) {
    ProgramError["InsecureContext"] = "INSECURE_CONTEXT";
    ProgramError["UnsupportedBrowser"] = "UNSUPPORTED_BROWSER";
})(ProgramError || (ProgramError = {}));
// ENTRY POINTS
/**
 * 🚀 Build an ODD program.
 *
 * This will give you a `Program` object which has the following properties:
 * - `session`, a `Session` object if a session was created before.
 * - `auth`, a means to control the various auth strategies you configured. Use this to create sessions. Read more about auth components in the toplevel `auth` object documention.
 * - `capabilities`, a means to control capabilities. Use this to collect & request capabilities, and to create a session based on them. Read more about capabilities in the toplevel `capabilities` object documentation.
 * - `components`, your full set of `Components`.
 *
 * This object also has a few other functions, for example to load a filesystem.
 * These are called "shorthands" because they're the same functions available
 * through other places in the ODD SDK, but you don't have to pass in the components.
 *
 * See `assemble` for more information. Note that this function checks for browser support,
 * while `assemble` does not. Use the latter in case you want to bypass the indexedDB check,
 * which might not be needed, or available, in certain environments or using certain components.
 */
export async function program(settings) {
    if (!settings)
        throw new Error("Expected a settings object of the type `Partial<Components> & Configuration` as the first parameter");
    // Check if the browser and context is supported
    if (globalThis.isSecureContext === false)
        throw ProgramError.InsecureContext;
    if (await isSupported() === false)
        throw ProgramError.UnsupportedBrowser;
    // Initialise components & assemble program
    const components = await gatherComponents(settings);
    return assemble(extractConfig(settings), components);
}
// PREDEFINED COMPONENTS
/**
 * Predefined auth configurations.
 *
 * This component goes hand in hand with the "reference" and "depot" components.
 * The "auth" component registers a DID and the reference looks it up.
 * The reference component also manages the "data root", the pointer to an account's entire filesystem.
 * The depot component is responsible for getting data to and from the other side.
 *
 * For example, using the Fission architecture, when a data root is updated on the Fission server,
 * the server fetches the data from the depot in your app.
 *
 * So if you want to build a service independent of Fission's infrastructure,
 * you will need to write your own reference and depot implementations (see source code).
 *
 * NOTE: If you're using a non-default component, you'll want to pass that in here as a parameter as well.
 *       Dependencies: crypto, manners, reference, storage.
 */
export const auth = {
    /**
     * A standalone authentication system that uses the browser's Web Crypto API
     * to create an identity based on a RSA key-pair.
     *
     * NOTE: This uses a Fission server to register an account (DID).
     *       Check out the `wnfs` and `base` auth implementations if
     *       you want to build something without the Fission infrastructure.
     */
    async fissionWebCrypto(settings) {
        const { disableWnfs, staging } = settings;
        const manners = settings.manners || defaultMannersComponent(settings);
        const crypto = settings.crypto || await defaultCryptoComponent(settings);
        const storage = settings.storage || defaultStorageComponent(settings);
        const reference = settings.reference || await defaultReferenceComponent({ crypto, manners, storage });
        if (disableWnfs) {
            if (staging)
                return FissionAuthBaseStaging.implementation({ crypto, reference, storage });
            return FissionAuthBaseProduction.implementation({ crypto, reference, storage });
        }
        else {
            if (staging)
                return FissionAuthWnfsStaging.implementation({ crypto, reference, storage });
            return FissionAuthWnfsProduction.implementation({ crypto, reference, storage });
        }
    }
};
/**
 * Predefined capabilities configurations.
 *
 * If you want partial read and/or write access to the filesystem you'll want
 * a "capabilities" component. This component is responsible for requesting
 * and receiving UCANs, read keys and namefilters from other sources to enable this.
 *
 * NOTE: If you're using a non-default component, you'll want to pass that in here as a parameter as well.
 *       Dependencies: crypto, depot.
 */
export const capabilities = {
    /**
     * A secure enclave in the form of a ODD app which serves as the root authority.
     * Your app is redirected to the lobby where the user can create an account or link a device,
     * and then request permissions from the user for reading or write to specific parts of the filesystem.
     */
    async fissionLobby(settings) {
        const { staging } = settings;
        const crypto = settings.crypto || await defaultCryptoComponent(settings);
        if (staging)
            return FissionLobbyStaging.implementation({ crypto });
        return FissionLobbyProduction.implementation({ crypto });
    }
};
/**
 * Predefined crypto configurations.
 *
 * The crypto component is responsible for various cryptographic operations.
 * This includes AES and RSA encryption & decryption, creating and storing
 * key pairs, verifying DIDs and defining their magic bytes, etc.
 */
export const crypto = {
    /**
     * The default crypto component, uses primarily the Web Crypto API and [keystore-idb](https://github.com/fission-codes/keystore-idb).
     * Keys are stored in a non-exportable way in indexedDB using the Web Crypto API.
     *
     * IndexedDB store is namespaced.
     */
    browser(settings) {
        return defaultCryptoComponent(settings);
    }
};
/**
 * Predefined depot configurations.
 *
 * The depot component gets data in and out your program.
 * For example, say I want to load and then update a file system.
 * The depot will get that file system data for me,
 * and after updating it, send the data to where it needs to be.
 */
export const depot = {
    /**
     * This depot uses IPFS and the Fission servers.
     * The data is transferred to the Fission IPFS node,
     * where all of your encrypted and public data lives.
     * Other ODD programs with this depot fetch the data from there.
     */
    async fissionIPFS(settings) {
        const repoName = `${namespace(settings)}/ipfs`;
        const storage = settings.storage || defaultStorageComponent(settings);
        if (settings.staging)
            return FissionIpfsStaging.implementation({ storage }, repoName);
        return FissionIpfsProduction.implementation({ storage }, repoName);
    }
};
/**
 * Predefined manners configurations.
 *
 * The manners component allows you to tweak various behaviours of an ODD program,
 * such as logging and file system hooks (eg. what to do after a new file system is created).
 */
export const manners = {
    /**
     * The default ODD SDK behaviour.
     */
    default(settings) {
        return defaultMannersComponent(settings);
    }
};
/**
 * Predefined reference configurations.
 *
 * The reference component is responsible for looking up and updating various pointers.
 * Specifically, the data root, a user's DID root, DNSLinks, DNS TXT records.
 * It also holds repositories (see `Repository` class), which contain UCANs and CIDs.
 *
 * NOTE: If you're using a non-default component, you'll want to pass that in here as a parameter as well.
 *       Dependencies: crypto, manners, storage.
 */
export const reference = {
    /**
     * Use the Fission servers as your reference.
     */
    async fission(settings) {
        const { staging } = settings;
        const manners = settings.manners || defaultMannersComponent(settings);
        const crypto = settings.crypto || await defaultCryptoComponent(settings);
        const storage = settings.storage || defaultStorageComponent(settings);
        if (staging)
            return FissionReferenceStaging.implementation({ crypto, manners, storage });
        return FissionReferenceProduction.implementation({ crypto, manners, storage });
    }
};
/**
 * Predefined storage configuration.
 *
 * A key-value storage abstraction responsible for storing various
 * pieces of data, such as session data and UCANs.
 */
export const storage = {
    /**
     * IndexedDB through the `localForage` library, automatically namespaced.
     */
    browser(settings) {
        return defaultStorageComponent(settings);
    },
    /**
     * In-memory store.
     */
    memory() {
        return MemoryStorage.implementation();
    }
};
// ASSEMBLE
/**
 * Build an ODD Program based on a given set of `Components`.
 * These are various customisable components that determine how an ODD app works.
 * Use `program` to work with a default, or partial, set of components.
 *
 * Additionally this does a few other things:
 * - Restores a session if one was made before and loads the user's file system if needed.
 * - Attempts to collect capabilities if the configuration has permissions.
 * - Provides shorthands to functions so you don't have to pass in components.
 * - Ensure backwards compatibility with older ODD SDK clients.
 *
 * See the `program.fileSystem.load` function if you want to load the user's file system yourself.
 */
export async function assemble(config, components) {
    const permissions = config.permissions;
    // Backwards compatibility (data)
    await ensureBackwardsCompatibility(components, config);
    // Event emitters
    const fsEvents = Events.createEmitter();
    const sessionEvents = Events.createEmitter();
    const allEvents = Events.merge(fsEvents, sessionEvents);
    // Authenticated user
    const sessionInfo = await SessionMod.restore(components.storage);
    // Auth implementations
    const auth = (method => {
        return {
            implementation: method,
            accountConsumer(username) {
                return createConsumer({ auth: method, crypto: components.crypto, manners: components.manners }, { username });
            },
            accountProducer(username) {
                return createProducer({ auth: method, crypto: components.crypto, manners: components.manners }, { username });
            },
            isUsernameAvailable: method.isUsernameAvailable,
            isUsernameValid: method.isUsernameValid,
            register: method.register,
            emailVerify: method.emailVerify,
            async session() {
                const newSessionInfo = await SessionMod.restore(components.storage);
                if (!newSessionInfo)
                    return null;
                return this.implementation.session(components, newSessionInfo.username, config, { fileSystem: fsEvents, session: sessionEvents });
            }
        };
    })(components.auth);
    // Capabilities
    const capabilities = {
        async collect() {
            const c = await components.capabilities.collect();
            if (!c)
                return null;
            await Capabilities.collect({
                capabilities: c,
                crypto: components.crypto,
                reference: components.reference,
                storage: components.storage
            });
            return c.username;
        },
        request(options) {
            return components.capabilities.request({
                permissions,
                ...(options || {})
            });
        },
        async session(username) {
            const ucan = Capabilities.validatePermissions(components.reference.repositories.ucans, permissions || {});
            if (!ucan) {
                console.warn("The present UCANs did not satisfy the configured permissions.");
                return null;
            }
            const accountDID = await components.reference.didRoot.lookup(username);
            const validSecrets = await Capabilities.validateSecrets(components.crypto, accountDID, permissions || {});
            if (!validSecrets) {
                console.warn("The present filesystem secrets did not satisfy the configured permissions.");
                return null;
            }
            await SessionMod.provide(components.storage, { type: CAPABILITIES_SESSION_TYPE, username });
            const fs = config.fileSystem?.loadImmediately === false ?
                undefined :
                await loadFileSystem({
                    config,
                    dependencies: components,
                    eventEmitter: fsEvents,
                    username,
                });
            return new Session({
                fs,
                username,
                crypto: components.crypto,
                storage: components.storage,
                type: CAPABILITIES_SESSION_TYPE,
                eventEmitter: sessionEvents
            });
        }
    };
    // Session
    let session = null;
    if (isCapabilityBasedAuthConfiguration(config)) {
        const username = await capabilities.collect();
        if (username)
            session = await capabilities.session(username);
        if (sessionInfo && sessionInfo.type === CAPABILITIES_SESSION_TYPE)
            session = await capabilities.session(sessionInfo.username);
    }
    else if (sessionInfo && sessionInfo.type !== CAPABILITIES_SESSION_TYPE) {
        session = await auth.session();
    }
    // Shorthands
    const shorthands = {
        // DIDs
        accountDID: (username) => components.reference.didRoot.lookup(username),
        agentDID: () => DID.agent(components.crypto),
        sharingDID: () => DID.sharing(components.crypto),
        // File system
        fileSystem: {
            addPublicExchangeKey: (fs) => FileSystemData.addPublicExchangeKey(components.crypto, fs),
            addSampleData: (fs) => FileSystemData.addSampleData(fs),
            hasPublicExchangeKey: (fs) => FileSystemData.hasPublicExchangeKey(components.crypto, fs),
            load: (username) => loadFileSystem({ config, username, dependencies: components, eventEmitter: fsEvents }),
            recover: (params) => recoverFileSystem({ auth, dependencies: components, ...params }),
        }
    };
    // Create `Program`
    const program = {
        ...shorthands,
        ...Events.listenTo(allEvents),
        configuration: { ...config },
        auth,
        components,
        capabilities,
        session,
    };
    // Inject into global context if necessary
    if (config.debug) {
        const inject = config.debugging?.injectIntoGlobalContext === undefined
            ? true
            : config.debugging?.injectIntoGlobalContext;
        if (inject) {
            const container = globalThis;
            container.__odd = container.__odd || {};
            container.__odd.programs = container.__odd.programs || {};
            container.__odd.programs[namespace(config)] = program;
        }
        const emitMessages = config.debugging?.emitWindowPostMessages === undefined
            ? true
            : config.debugging?.emitWindowPostMessages;
        if (emitMessages) {
            const { connect, disconnect } = await Extension.create({
                namespace: config.namespace,
                session,
                capabilities: config.permissions,
                dependencies: components,
                eventEmitters: {
                    fileSystem: fsEvents,
                    session: sessionEvents
                }
            });
            const container = globalThis;
            container.__odd = container.__odd || {};
            container.__odd.extension = container.__odd.extension || {};
            container.__odd.extension.connect = connect;
            container.__odd.extension.disconnect = disconnect;
            // Notify extension that the ODD SDK is ready
            globalThis.postMessage({
                id: "odd-devtools-ready-message",
            });
        }
    }
    // Fin
    return program;
}
// COMPOSITIONS
/**
 * Full component sets.
 */
export const compositions = {
    /**
     * The default Fission stack using web crypto auth.
     */
    async fission(settings) {
        const crypto = settings.crypto || await defaultCryptoComponent(settings);
        const manners = settings.manners || defaultMannersComponent(settings);
        const storage = settings.storage || defaultStorageComponent(settings);
        const settingsWithComponents = { ...settings, crypto, manners, storage };
        const r = await reference.fission(settingsWithComponents);
        const d = await depot.fissionIPFS(settingsWithComponents);
        const c = await capabilities.fissionLobby(settingsWithComponents);
        const a = await auth.fissionWebCrypto({ ...settingsWithComponents, reference: r });
        return {
            auth: a,
            capabilities: c,
            depot: d,
            reference: r,
            crypto,
            manners,
            storage,
        };
    }
};
export async function gatherComponents(setup) {
    const config = extractConfig(setup);
    const crypto = setup.crypto || await defaultCryptoComponent(config);
    const manners = setup.manners || defaultMannersComponent(config);
    const storage = setup.storage || defaultStorageComponent(config);
    const reference = setup.reference || await defaultReferenceComponent({ crypto, manners, storage });
    const depot = setup.depot || await defaultDepotComponent({ storage }, config);
    const capabilities = setup.capabilities || defaultCapabilitiesComponent({ crypto });
    const auth = setup.auth || defaultAuthComponent({ crypto, reference, storage });
    return {
        auth,
        capabilities,
        crypto,
        depot,
        manners,
        reference,
        storage,
    };
}
// DEFAULT COMPONENTS
export function defaultAuthComponent({ crypto, reference, storage }) {
    return FissionAuthWnfsProduction.implementation({
        crypto, reference, storage,
    });
}
export function defaultCapabilitiesComponent({ crypto }) {
    return FissionLobbyProduction.implementation({ crypto });
}
export function defaultCryptoComponent(config) {
    return BrowserCrypto.implementation({
        storeName: namespace(config),
        exchangeKeyName: "exchange-key",
        writeKeyName: "write-key"
    });
}
export function defaultDepotComponent({ storage }, config) {
    return FissionIpfsProduction.implementation({ storage }, `${namespace(config)}/ipfs`);
}
export function defaultMannersComponent(config) {
    return ProperManners.implementation({
        configuration: config
    });
}
export function defaultReferenceComponent({ crypto, manners, storage }) {
    return FissionReferenceProduction.implementation({
        crypto,
        manners,
        storage,
    });
}
export function defaultStorageComponent(config) {
    return BrowserStorage.implementation({
        name: namespace(config)
    });
}
// 🛟
/**
 * Is this browser supported?
 */
export async function isSupported() {
    return localforage.supports(localforage.INDEXEDDB)
        // Firefox in private mode can't use indexedDB properly,
        // so we test if we can actually make a database.
        && await (() => new Promise(resolve => {
            const db = indexedDB.open("testDatabase");
            db.onsuccess = () => resolve(true);
            db.onerror = () => resolve(false);
        }))();
}
// BACKWARDS COMPAT
async function ensureBackwardsCompatibility(components, config) {
    // Old pieces:
    // - Key pairs: IndexedDB → keystore → exchange-key & write-key
    // - UCAN used for account linking/delegation: IndexedDB → localforage → ucan
    // - Root read key of the filesystem: IndexedDB → localforage → readKey
    // - Authenticated username: IndexedDB → localforage → webnative.auth_username
    const [migK, migV] = ["migrated", VERSION];
    const currentVersion = Semver.fromString(VERSION);
    if (!currentVersion)
        throw new Error("The ODD SDK VERSION should be a semver string");
    // If already migrated, stop here.
    const migrationOccurred = await components.storage
        .getItem(migK)
        .then(v => typeof v === "string" ? Semver.fromString(v) : null)
        .then(v => v && Semver.isBiggerThanOrEqualTo(v, currentVersion));
    if (migrationOccurred)
        return;
    // Only try to migrate if environment supports indexedDB
    if (!globalThis.indexedDB)
        return;
    // Migration
    const existingDatabases = globalThis.indexedDB.databases
        ? (await globalThis.indexedDB.databases()).map(db => db.name)
        : ["keystore", "localforage"];
    const keystoreDB = existingDatabases.includes("keystore") ? await bwOpenDatabase("keystore") : null;
    if (keystoreDB) {
        const exchangeKeyPair = await bwGetValue(keystoreDB, "keyvaluepairs", "exchange-key");
        const writeKeyPair = await bwGetValue(keystoreDB, "keyvaluepairs", "write-key");
        if (exchangeKeyPair && writeKeyPair) {
            await components.storage.setItem("exchange-key", exchangeKeyPair);
            await components.storage.setItem("write-key", writeKeyPair);
        }
    }
    const localforageDB = existingDatabases.includes("localforage") ? await bwOpenDatabase("localforage") : null;
    if (localforageDB) {
        const accountUcan = await bwGetValue(localforageDB, "keyvaluepairs", "ucan");
        const permissionedUcans = await bwGetValue(localforageDB, "keyvaluepairs", "webnative.auth_ucans");
        const rootKey = await bwGetValue(localforageDB, "keyvaluepairs", "readKey");
        const authedUser = await bwGetValue(localforageDB, "keyvaluepairs", "webnative.auth_username");
        if (rootKey && isString(rootKey)) {
            const anyUcan = accountUcan || (Array.isArray(permissionedUcans) ? permissionedUcans[0] : undefined);
            const accountDID = anyUcan ? Ucan.rootIssuer(anyUcan) : (typeof authedUser === "string" ? await components.reference.didRoot.lookup(authedUser) : null);
            if (!accountDID)
                throw new Error("Failed to retrieve account DID");
            await RootKey.store({
                accountDID,
                crypto: components.crypto,
                readKey: Uint8arrays.fromString(rootKey, "base64pad"),
            });
        }
        if (accountUcan) {
            await components.storage.setItem(components.storage.KEYS.ACCOUNT_UCAN, accountUcan);
        }
        if (authedUser) {
            await components.storage.setItem(components.storage.KEYS.SESSION, JSON.stringify({
                type: isCapabilityBasedAuthConfiguration(config) ? CAPABILITIES_SESSION_TYPE : WEB_CRYPTO_SESSION_TYPE,
                username: authedUser
            }));
        }
    }
    await components.storage.setItem(migK, migV);
}
function bwGetValue(db, storeName, key) {
    return new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains(storeName))
            return resolve(null);
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const req = store.get(key);
        req.onerror = () => {
            // No store, moving on.
            resolve(null);
        };
        req.onsuccess = () => {
            resolve(req.result);
        };
    });
}
function bwOpenDatabase(name) {
    return new Promise((resolve, reject) => {
        const req = globalThis.indexedDB.open(name);
        req.onerror = () => {
            // No database, moving on.
            resolve(null);
        };
        req.onsuccess = () => {
            resolve(req.result);
        };
        req.onupgradeneeded = e => {
            // Don't create database if it didn't exist before
            req.transaction?.abort();
            globalThis.indexedDB.deleteDatabase(name);
        };
    });
}
// 🛠
export function extractConfig(opts) {
    return {
        namespace: opts.namespace,
        debug: opts.debug,
        fileSystem: opts.fileSystem,
        permissions: opts.permissions,
        userMessages: opts.userMessages,
    };
}
/**
 * Is this a configuration that uses capabilities?
 */
export function isCapabilityBasedAuthConfiguration(config) {
    return !!config.permissions;
}
//# sourceMappingURL=index.js.map