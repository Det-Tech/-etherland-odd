import * as DOH from "../../dns-over-https.js";
/**
 * Get the root write-key DID for a user.
 * Stored at `_did.${username}.${endpoints.user}`
 */
export async function root(endpoints, username) {
    try {
        console.log("did ", `_did.${username}.${endpoints.userDomain}`)
        const maybeDid = await DOH.lookupTxtRecord(`_did.${username}.${endpoints.userDomain}`);
        if (maybeDid !== null)
            return maybeDid;
    }
    catch (_err) {
        // lookup failed
    }
    throw new Error("Could not locate user DID in DNS.");
}
//# sourceMappingURL=did.js.map