import * as Auth from "../components/auth/implementation.js";
import * as Crypto from "../components/crypto/implementation.js";
import * as Manners from "../components/manners/implementation.js";
import { Components } from "../components.js";
import { EventListener } from "../common/event-emitter.js";
import type { Result } from "../common/index.js";
export declare type AccountLinkingConsumer = {
    on: <K extends keyof ConsumerEventMap>(eventName: K, listener: EventListener<ConsumerEventMap[K]>) => void;
    cancel: () => void;
};
export interface ConsumerEventMap {
    "challenge": {
        pin: number[];
    };
    "link": {
        approved: boolean;
        username: string;
    };
    "done": undefined;
}
export declare type Dependencies = {
    auth: Auth.Implementation<Components>;
    crypto: Crypto.Implementation;
    manners: Manners.Implementation;
};
/**
 * Create an account linking consumer
 *
 * @param options consumer options
 * @param options.username username of the account
 * @returns an account linking event emitter and cancel function
 */
export declare const createConsumer: (dependencies: Dependencies, options: {
    username: string;
}) => Promise<AccountLinkingConsumer>;
/**
 *  BROADCAST
 *
 * Generate a temporary RSA keypair and extract a temporary DID from it.
 * The temporary DID will be broadcast on the channel to start the linking process.
 *
 * @returns temporary RSA key pair and temporary DID
 */
export declare const generateTemporaryExchangeKey: (crypto: Crypto.Implementation) => Promise<{
    temporaryRsaPair: CryptoKeyPair;
    temporaryDID: string;
}>;
/**
 *  NEGOTIATION
 *
 * Decrypt the session key and check the closed UCAN for capability.
 * The session key is encrypted with the temporary RSA keypair.
 * The closed UCAN is encrypted with the session key.
 *
 * @param temporaryRsaPrivateKey
 * @param data
 * @returns AES session key
 */
export declare const handleSessionKey: (crypto: Crypto.Implementation, temporaryRsaPrivateKey: CryptoKey, data: string) => Promise<Result<Uint8Array, Error>>;
/**
 * NEGOTIATION
 *
 * Generate pin and challenge message for verification by the producer.
 *
 * @param sessionKey
 * @returns pin and challenge message
 */
export declare const generateUserChallenge: (crypto: Crypto.Implementation, sessionKey: Uint8Array) => Promise<{
    pin: number[];
    challenge: string;
}>;
/**
 * DELEGATION
 *
 * Decrypt the delegated credentials and forward to the dependency injected linkDevice function,
 * or report that delegation was declined.
 *
 * @param sessionKey
 * @param username
 * @param data
 * @returns linking result
 */
export declare const linkDevice: (auth: Auth.Implementation<Components>, crypto: Crypto.Implementation, sessionKey: Uint8Array, username: string, data: string) => Promise<Result<{
    approved: boolean;
}, Error>>;
