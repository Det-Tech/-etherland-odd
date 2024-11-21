import { CID } from "multiformats/cid";
import * as Fission from "../../../../common/fission.js";
import * as Ucan from "../../../../ucan/index.js";
import { Dependencies } from "../base.js";
/**
 * Get the CID of a user's data root.
 * First check Fission server, then check DNS
 *
 * @param username The username of the user that we want to get the data root of.
 */
export declare function lookup(endpoints: Fission.Endpoints, dependencies: Dependencies, username: string): Promise<CID | null>;
/**
 * Get the CID of a user's data root from the Fission server.
 *
 * @param username The username of the user that we want to get the data root of.
 */
export declare function lookupOnFisson(endpoints: Fission.Endpoints, dependencies: Dependencies, username: string): Promise<CID | null>;
/**
 * Update a user's data root.
 *
 * @param cid The CID of the data root.
 * @param proof The proof to use in the UCAN sent to the API.
 */
export declare function update(endpoints: Fission.Endpoints, dependencies: Dependencies, cidInstance: CID, proof: Ucan.Ucan): Promise<{
    success: boolean;
}>;
