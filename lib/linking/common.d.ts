import type { Result } from "../common/types.js";
import * as Manners from "../components/manners/implementation.js";
export declare enum LinkingStep {
    Broadcast = "BROADCAST",
    Negotiation = "NEGOTIATION",
    Delegation = "DELEGATION"
}
export declare class LinkingError extends Error {
    constructor(message: string);
}
export declare class LinkingWarning extends Error {
    constructor(message: string);
}
export declare const handleLinkingError: (manners: Manners.Implementation, error: LinkingError | LinkingWarning) => void;
export declare const tryParseMessage: <T>(data: string, typeGuard: (message: unknown) => message is T, context: {
    participant: string;
    callSite: string;
}) => Result<T, LinkingWarning>;
