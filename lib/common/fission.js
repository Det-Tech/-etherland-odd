import * as DOH from "../components/reference/dns-over-https.js";
export const PRODUCTION = {
    apiPath: "/api/v0",
    lobby: "https://auth.etherland.world",
    server: "https://auth.etherland.world",
    did: "https://server.etherland.me",
    userDomain: "etherland.me"
};
// _did.server.etherland.me
export const STAGING = {
    apiPath: "/api/v0",
    lobby: "https://auth.etherland.world",
    server: "https://auth.etherland.world",
    did: "https://server.etherland.me",
    userDomain: "etherland.me"
};
export function apiUrl(endpoints, suffix) {
    return `${endpoints.server}${endpoints.apiPath}${suffix?.length ? "/" + suffix.replace(/^\/+/, "") : ""}`;
}
// API
const didCache = {
    did: null,
    host: null,
    lastFetched: 0,
};
/**
 * Lookup the DID of a Fission API.
 * This function caches the DID for 3 hours.
 */
export async function did(endpoints) {
    let host;
    console.log("did **s ", `_did.${endpoints.userDomain}`);
    try {
        host = new URL(endpoints.did).host;
    }
    catch (e) {
        throw new Error("Unable to parse API Endpoint");
    }
    const now = Date.now(); // in milliseconds
    if (didCache.host !== host ||
        didCache.lastFetched + 1000 * 60 * 60 * 3 <= now) {
        didCache.did = await DOH.lookupTxtRecord("_did." + host);
        didCache.host = host;
        didCache.lastFetched = now;
    }
    if (!didCache.did)
        throw new Error("Couldn't get the Fission API DID");
    return didCache.did;
}
/**
 * Create a share link.
 * There people can "accept" a share,
 * copying the soft links into their private filesystem.
 */
export function shareLink(endpoints, details) {
    return endpoints.lobby +
        "/#/share/" +
        encodeURIComponent(details.sharedBy.username) + "/" +
        encodeURIComponent(details.shareId) + "/";
}
//# sourceMappingURL=fission.js.map