import type { CID } from "multiformats/cid";
import * as Crypto from "../components/crypto/implementation.js";
import * as Fission from "../common/fission.js";
import * as Reference from "../components/reference/implementation.js";
import { Maybe } from "../common/types.js";
export declare type AppMetadata = {
    domains: string[];
    insertedAt: string;
    modifiedAt: string;
};
export declare type Dependencies = {
    crypto: Crypto.Implementation;
    reference: Reference.Implementation;
};
/**
 * Get A list of all of your apps and their associated domain names
 */
export declare function index(endpoints: Fission.Endpoints, dependencies: Dependencies): Promise<Array<AppMetadata>>;
/**
 * Creates a new app, assigns an initial subdomain, and sets an asset placeholder
 *
 * @param subdomain Subdomain to create the fission app with
 */
export declare function create(endpoints: Fission.Endpoints, dependencies: Dependencies, subdomain: Maybe<string>): Promise<AppMetadata>;
/**
 * Destroy app by any associated domain
 *
 * @param domain The domain associated with the app we want to delete
 */
export declare function deleteByDomain(endpoints: Fission.Endpoints, dependencies: Dependencies, domain: string): Promise<void>;
/**
 * Updates an app by CID
 *
 * @param subdomain Subdomain to create the fission app with
 */
export declare function publish(endpoints: Fission.Endpoints, dependencies: Dependencies, domain: string, cid: CID): Promise<void>;
