import * as DOH from "../components/reference/dns-over-https.js"
import { ShareDetails } from "../fs/types.js"


/**
 * Fission endpoints.
 *
 * `apiPath` Path of the API on the Fission server.
 * `lobby` Location of the authentication lobby.
 * `server` Location of the Fission server.
 * `userDomain` User's domain to use, will be prefixed by username.
 */
export type Endpoints = {
  apiPath: string
  lobby: string
  server: string
  did: string
  userDomain: string
}

export const PRODUCTION: Endpoints = {
  apiPath: "/api/v0",
  lobby: "https://auth.etherland.world",
  server: "https://auth.etherland.world",
  did: "https://server.etherland.me",
  userDomain: "etherland.me"
}

// _did.server.etherland.me

export const STAGING: Endpoints = {
  apiPath: "/api/v0",
  lobby: "https://auth.etherland.world",
  server: "https://auth.etherland.world",
  did: "https://server.etherland.me",
  userDomain: "etherland.me"
}

export function apiUrl(endpoints: Endpoints, suffix?: string): string {
  return `${endpoints.server}${endpoints.apiPath}${suffix?.length ? "/" + suffix.replace(/^\/+/, "") : ""}`
}

// API

const didCache: {
  did: string | null
  host: string | null
  lastFetched: number
} = {
  did: null,
  host: null,
  lastFetched: 0,
}


/**
 * Lookup the DID of a Fission API.
 * This function caches the DID for 3 hours.
 */
export async function did(endpoints: Endpoints): Promise<string> {
  let host
  console.log("did **s ", `_did.${endpoints.userDomain}`)
  try {
    host = new URL(endpoints.did).host
  } catch (e) {
    throw new Error("Unable to parse API Endpoint")
  }
  const now = Date.now() // in milliseconds

  if (
    didCache.host !== host ||
    didCache.lastFetched + 1000 * 60 * 60 * 3 <= now
  ) {
    didCache.did = await DOH.lookupTxtRecord("_did." + host)
    didCache.host = host
    didCache.lastFetched = now
  }

  if (!didCache.did) throw new Error("Couldn't get the Fission API DID")
  return didCache.did
}


/**
 * Create a share link.
 * There people can "accept" a share,
 * copying the soft links into their private filesystem.
 */
export function shareLink(endpoints: Endpoints, details: ShareDetails): string {
  return endpoints.lobby +
    "/#/share/" +
    encodeURIComponent(details.sharedBy.username) + "/" +
    encodeURIComponent(details.shareId) + "/"
}
