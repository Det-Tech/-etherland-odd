import * as Fission from "../../../../common/fission.js";
/**
 * Get the root write-key DID for a user.
 * Stored at `_did.${username}.${endpoints.user}`
 */
export declare function root(endpoints: Fission.Endpoints, username: string): Promise<string>;
