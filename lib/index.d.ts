import * as Auth from "./components/auth/implementation.js";
import * as CapabilitiesImpl from "./components/capabilities/implementation.js";
import * as Crypto from "./components/crypto/implementation.js";
import * as Depot from "./components/depot/implementation.js";
import * as Events from "./events.js";
import * as IpfsNode from "./components/depot/implementation/ipfs/node.js";
import * as Manners from "./components/manners/implementation.js";
import * as Reference from "./components/reference/implementation.js";
import * as Storage from "./components/storage/implementation.js";
import { AccountLinkingConsumer, AccountLinkingProducer } from "./linking/index.js";
import { Components } from "./components.js";
import { Configuration } from "./configuration.js";
import { Maybe } from "./common/index.js";
import { Session } from "./session.js";
import FileSystem from "./fs/filesystem.js";
import { type RecoverFileSystemParams } from "./fs/types/params.js";
import * as BaseAuth from "./components/auth/implementation/base.js";
import * as BaseReference from "./components/reference/implementation/base.js";
import * as FissionLobbyBase from "./components/capabilities/implementation/fission-lobby.js";
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
export { AccountLinkingConsumer, AccountLinkingProducer } from "./linking/index.js";
export { FileSystem } from "./fs/filesystem.js";
export { Session } from "./session.js";
export declare type AuthenticationStrategy = {
    implementation: Auth.Implementation<Components>;
    accountConsumer: (username: string) => Promise<AccountLinkingConsumer>;
    accountProducer: (username: string) => Promise<AccountLinkingProducer>;
    isUsernameAvailable: (username: string) => Promise<boolean>;
    isUsernameValid: (username: string) => Promise<boolean>;
    register: (options: {
        username: string;
        email: string;
        code: string;
        hashedUsername: string;
    }) => Promise<{
        success: boolean;
    }>;
    session: () => Promise<Maybe<Session>>;
    emailVerify: (options: {
        email: string;
    }) => Promise<{
        success: boolean;
    }>;
};
export declare type Program = ShortHands & Events.ListenTo<Events.All<Session>> & {
    /**
     * Authentication strategy, use this interface to register an account and link devices.
     */
    auth: AuthenticationStrategy;
    capabilities: {
        /**
         * Collect capabilities.
         */
        collect: () => Promise<Maybe<string>>;
        /**
         * Request capabilities.
         *
         * Permissions from your configuration are passed automatically,
         * but you can add additional permissions or override existing ones.
         */
        request: (options?: CapabilitiesImpl.RequestOptions) => Promise<void>;
        /**
         * Try to create a `Session` based on capabilities.
         */
        session: (username: string) => Promise<Maybe<Session>>;
    };
    /**
     * Configuration used to build this program.
     */
    configuration: Configuration;
    /**
     * Components used to build this program.
     */
    components: Components;
    /**
     * Various file system methods.
     */
    fileSystem: FileSystemShortHands;
    /**
     * Existing session, if there is one.
     */
    session: Maybe<Session>;
};
export declare enum ProgramError {
    InsecureContext = "INSECURE_CONTEXT",
    UnsupportedBrowser = "UNSUPPORTED_BROWSER"
}
export declare type ShortHands = {
    accountDID: (username: string) => Promise<string>;
    agentDID: () => Promise<string>;
    sharingDID: () => Promise<string>;
};
export declare type FileSystemShortHands = {
    addPublicExchangeKey: (fs: FileSystem) => Promise<void>;
    addSampleData: (fs: FileSystem) => Promise<void>;
    hasPublicExchangeKey: (fs: FileSystem) => Promise<boolean>;
    /**
     * Load the file system of a given username.
     */
    load: (username: string) => Promise<FileSystem>;
    /**
     * Recover a file system.
     */
    recover: (params: RecoverFileSystemParams) => Promise<{
        success: boolean;
    }>;
};
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
export declare function program(settings: Partial<Components> & Configuration): Promise<Program>;
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
export declare const auth: {
    /**
     * A standalone authentication system that uses the browser's Web Crypto API
     * to create an identity based on a RSA key-pair.
     *
     * NOTE: This uses a Fission server to register an account (DID).
     *       Check out the `wnfs` and `base` auth implementations if
     *       you want to build something without the Fission infrastructure.
     */
    fissionWebCrypto(settings: Configuration & {
        disableWnfs?: boolean;
        staging?: boolean;
        crypto?: Crypto.Implementation;
        manners?: Manners.Implementation;
        reference?: Reference.Implementation;
        storage?: Storage.Implementation;
    }): Promise<Auth.Implementation<Components>>;
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
export declare const capabilities: {
    /**
     * A secure enclave in the form of a ODD app which serves as the root authority.
     * Your app is redirected to the lobby where the user can create an account or link a device,
     * and then request permissions from the user for reading or write to specific parts of the filesystem.
     */
    fissionLobby(settings: Configuration & {
        staging?: boolean;
        crypto?: Crypto.Implementation;
    }): Promise<CapabilitiesImpl.Implementation>;
};
/**
 * Predefined crypto configurations.
 *
 * The crypto component is responsible for various cryptographic operations.
 * This includes AES and RSA encryption & decryption, creating and storing
 * key pairs, verifying DIDs and defining their magic bytes, etc.
 */
export declare const crypto: {
    /**
     * The default crypto component, uses primarily the Web Crypto API and [keystore-idb](https://github.com/fission-codes/keystore-idb).
     * Keys are stored in a non-exportable way in indexedDB using the Web Crypto API.
     *
     * IndexedDB store is namespaced.
     */
    browser(settings: Configuration): Promise<Crypto.Implementation>;
};
/**
 * Predefined depot configurations.
 *
 * The depot component gets data in and out your program.
 * For example, say I want to load and then update a file system.
 * The depot will get that file system data for me,
 * and after updating it, send the data to where it needs to be.
 */
export declare const depot: {
    /**
     * This depot uses IPFS and the Fission servers.
     * The data is transferred to the Fission IPFS node,
     * where all of your encrypted and public data lives.
     * Other ODD programs with this depot fetch the data from there.
     */
    fissionIPFS(settings: Configuration & {
        staging?: boolean;
        storage?: Storage.Implementation;
    }): Promise<Depot.Implementation>;
};
/**
 * Predefined manners configurations.
 *
 * The manners component allows you to tweak various behaviours of an ODD program,
 * such as logging and file system hooks (eg. what to do after a new file system is created).
 */
export declare const manners: {
    /**
     * The default ODD SDK behaviour.
     */
    default(settings: Configuration): Manners.Implementation;
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
export declare const reference: {
    /**
     * Use the Fission servers as your reference.
     */
    fission(settings: Configuration & {
        staging?: boolean;
        crypto?: Crypto.Implementation;
        manners?: Manners.Implementation;
        storage?: Storage.Implementation;
    }): Promise<Reference.Implementation>;
};
/**
 * Predefined storage configuration.
 *
 * A key-value storage abstraction responsible for storing various
 * pieces of data, such as session data and UCANs.
 */
export declare const storage: {
    /**
     * IndexedDB through the `localForage` library, automatically namespaced.
     */
    browser(settings: Configuration): Storage.Implementation;
    /**
     * In-memory store.
     */
    memory(): Storage.Implementation;
};
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
export declare function assemble(config: Configuration, components: Components): Promise<Program>;
/**
 * Full component sets.
 */
export declare const compositions: {
    /**
     * The default Fission stack using web crypto auth.
     */
    fission(settings: Configuration & {
        disableWnfs?: boolean;
        staging?: boolean;
        crypto?: Crypto.Implementation;
        manners?: Manners.Implementation;
        storage?: Storage.Implementation;
    }): Promise<Components>;
};
export declare function gatherComponents(setup: Partial<Components> & Configuration): Promise<Components>;
export declare function defaultAuthComponent({ crypto, reference, storage }: BaseAuth.Dependencies): Auth.Implementation<Components>;
export declare function defaultCapabilitiesComponent({ crypto }: FissionLobbyBase.Dependencies): CapabilitiesImpl.Implementation;
export declare function defaultCryptoComponent(config: Configuration): Promise<Crypto.Implementation>;
export declare function defaultDepotComponent({ storage }: IpfsNode.Dependencies, config: Configuration): Promise<Depot.Implementation>;
export declare function defaultMannersComponent(config: Configuration): Manners.Implementation;
export declare function defaultReferenceComponent({ crypto, manners, storage }: BaseReference.Dependencies): Promise<Reference.Implementation>;
export declare function defaultStorageComponent(config: Configuration): Storage.Implementation;
/**
 * Is this browser supported?
 */
export declare function isSupported(): Promise<boolean>;
export declare function extractConfig(opts: Partial<Components> & Configuration): Configuration;
/**
 * Is this a configuration that uses capabilities?
 */
export declare function isCapabilityBasedAuthConfiguration(config: Configuration): boolean;
