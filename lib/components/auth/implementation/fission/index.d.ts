import type { Dependencies } from "../base.js";
import * as Crypto from "../../../crypto/implementation.js";
import * as Reference from "../../../reference/implementation.js";
import { Endpoints } from "../../../../common/fission.js";
export * from "../../../../common/fission.js";
/**
 * Create a user account.
 */
export declare function createAccount(endpoints: Endpoints, dependencies: Dependencies, userProps: {
    username: string;
    email: string;
    code: string;
}): Promise<{
    success: boolean;
}>;
/**
 * Create a user account.
 */
export declare function emailVerify(endpoints: Endpoints, userProps: {
    email?: string;
}): Promise<{
    success: boolean;
}>;
/**
 * Check if a username is available.
 */
export declare function isUsernameAvailable(endpoints: Endpoints, username: string): Promise<boolean>;
/**
 * Check if a username is valid.
 */
export declare function isUsernameValid(username: string): boolean;
/**
 * Ask the fission server to send another verification email to the
 * user currently logged in.
 *
 * Throws if the user is not logged in.
 */
export declare function resendVerificationEmail(endpoints: Endpoints, crypto: Crypto.Implementation, reference: Reference.Implementation): Promise<{
    success: boolean;
}>;
