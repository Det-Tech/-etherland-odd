import * as Auth from "../components/auth/implementation.js";
import * as Crypto from "../components/crypto/implementation.js";
import * as Manners from "../components/manners/implementation.js";
import { Components } from "../components.js";
import { EventListener } from "../common/event-emitter.js";
import type { Result } from "../common/index.js";
export declare type AccountLinkingProducer = {
    on: <K extends keyof ProducerEventMap>(eventName: K, listener: EventListener<ProducerEventMap[K]>) => void;
    cancel: () => void;
};
export interface ProducerEventMap {
    "challenge": {
        pin: number[];
        confirmPin: () => void;
        rejectPin: () => void;
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
 * Create an account linking producer
 *
 * @param options producer options
 * @param options.username username of the account
 * @returns an account linking event emitter and cancel function
 */
export declare const createProducer: (dependencies: Dependencies, options: {
    username: string;
}) => Promise<AccountLinkingProducer>;
/**
 * BROADCAST
 *
 * Generate a session key and prepare a session key message to send to the consumer.
 *
 * @param didThrowaway
 * @returns session key and session key message
 */
export declare const generateSessionKey: (crypto: Crypto.Implementation, didThrowaway: string) => Promise<{
    sessionKey: CryptoKey;
    sessionKeyMessage: string;
}>;
/**
 * NEGOTIATION
 *
 * Decrypt the user challenge and the consumer audience DID.
 *
 * @param data
 * @returns pin and audience
 */
export declare const handleUserChallenge: (crypto: Crypto.Implementation, sessionKey: CryptoKey, data: string) => Promise<Result<{
    pin: number[];
    audience: string;
}, Error>>;
/**
 * DELEGATION: Delegate account
 *
 * Request delegation from the dependency injected delegateAccount function.
 * Prepare a delegation message to send to the consumer.
 *
 * @param sesionKey
 * @param audience
 * @param finishDelegation
 */
export declare const delegateAccount: (auth: Auth.Implementation<Components>, crypto: Crypto.Implementation, sessionKey: CryptoKey, username: string, audience: string, finishDelegation: (delegationMessage: string, approved: boolean) => Promise<void>) => Promise<void>;
/**
 * DELEGATION: Decline delegation
 *
 * Prepare a delegation declined message to send to the consumer.
 *
 * @param sessionKey
 * @param finishDelegation
 */
export declare const declineDelegation: (crypto: Crypto.Implementation, sessionKey: CryptoKey, finishDelegation: (delegationMessage: string, approved: boolean) => Promise<void>) => Promise<void>;
