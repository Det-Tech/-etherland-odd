import * as DOH from "../../dns-over-https.js"
import * as Fission from "../../../../common/fission.js"


/**
 * Get the root write-key DID for a user.
 * Stored at `_did.${username}.${endpoints.user}`
 */
export async function root(
  endpoints: Fission.Endpoints,
  username: string
): Promise<string> {
  try {
    console.log("did !!!! %%", `_did.${username}.${endpoints.userDomain}`)
    console.log("localstorage 1 ",localStorage.getItem("user"))
    let name = username;
    if(localStorage.getItem("user")){
      username = JSON.parse(localStorage.getItem("user")!).username.split(".")[0]
      name = username;
      console.log("username ", username)
    }
    const maybeDid = await DOH.lookupTxtRecord(`_did.${name}.${endpoints.userDomain}`)
    console.log("maybeDid ***", maybeDid)
    if (maybeDid !== null) return maybeDid
  } catch (_err) {
    console.log("err", _err)
    // lookup failed
  }

  throw new Error("Could not locate user DID in DNS.")
}
