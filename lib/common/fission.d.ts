import { ShareDetails } from "../fs/types.js";
/**
 * Fission endpoints.
 *
 * `apiPath` Path of the API on the Fission server.
 * `lobby` Location of the authentication lobby.
 * `server` Location of the Fission server.
 * `userDomain` User's domain to use, will be prefixed by username.
 */
export declare type Endpoints = {
    apiPath: string;
    lobby: string;
    server: string;
    did: string;
    userDomain: string;
};
export declare const PRODUCTION: Endpoints;
export declare const STAGING: Endpoints;
export declare function apiUrl(endpoints: Endpoints, suffix?: string): string;
/**
 * Lookup the DID of a Fission API.
 * This function caches the DID for 3 hours.
 */
export declare function did(endpoints: Endpoints): Promise<string>;
/**
 * Create a share link.
 * There people can "accept" a share,
 * copying the soft links into their private filesystem.
 */
export declare function shareLink(endpoints: Endpoints, details: ShareDetails): string;
