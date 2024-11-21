import * as DID from "../did/index.js";
import * as Fission from "../common/fission.js";
import * as Ucan from "../ucan/index.js";
import { isString } from "../common/type-checks.js";
/**
 * Get A list of all of your apps and their associated domain names
 */
export async function index(endpoints, dependencies) {
    const localUcan = await dependencies.reference.repositories.ucans.lookupAppUcan("*");
    if (localUcan === null) {
        throw "Could not find your local UCAN";
    }
    const jwt = Ucan.encode(await Ucan.build({
        dependencies: dependencies,
        audience: await Fission.did(endpoints),
        issuer: await DID.ucan(dependencies.crypto),
        proof: localUcan,
        potency: null
    }));
    const response = await fetch(Fission.apiUrl(endpoints, "/app"), {
        method: "GET",
        headers: {
            "authorization": `Bearer ${jwt}`
        }
    });
    const data = await response.json();
    return Object
        .values(data)
        .filter(v => v.urls.length > 0)
        .map(({ urls, insertedAt, modifiedAt }) => ({ domains: urls, insertedAt, modifiedAt }));
}
/**
 * Creates a new app, assigns an initial subdomain, and sets an asset placeholder
 *
 * @param subdomain Subdomain to create the fission app with
 */
export async function create(endpoints, dependencies, subdomain) {
    const localUcan = await dependencies.reference.repositories.ucans.lookupAppUcan("*");
    if (localUcan === null) {
        throw "Could not find your local UCAN";
    }
    const jwt = Ucan.encode(await Ucan.build({
        dependencies,
        audience: await Fission.did(endpoints),
        issuer: await DID.ucan(dependencies.crypto),
        proof: localUcan,
        potency: null
    }));
    const url = isString(subdomain)
        ? Fission.apiUrl(endpoints, `/app?subdomain=${encodeURIComponent(subdomain)}`)
        : Fission.apiUrl(endpoints, `/app`);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "authorization": `Bearer ${jwt}`
        }
    });
    const data = await response.json();
    const nowIso = (new Date()).toISOString();
    return {
        domains: [data],
        insertedAt: nowIso,
        modifiedAt: nowIso
    };
}
/**
 * Destroy app by any associated domain
 *
 * @param domain The domain associated with the app we want to delete
 */
export async function deleteByDomain(endpoints, dependencies, domain) {
    const localUcan = await dependencies.reference.repositories.ucans.lookupAppUcan(domain);
    if (localUcan === null) {
        throw new Error("Could not find your local UCAN");
    }
    const jwt = Ucan.encode(await Ucan.build({
        dependencies,
        audience: await Fission.did(endpoints),
        issuer: await DID.ucan(dependencies.crypto),
        proof: localUcan,
        potency: null
    }));
    const appIndexResponse = await fetch(Fission.apiUrl(endpoints, "/app"), {
        method: "GET",
        headers: {
            "authorization": `Bearer ${jwt}`
        }
    });
    const index = await appIndexResponse.json();
    const appToDelete = Object.entries(index).find(([_, app]) => app.urls.includes(domain));
    if (appToDelete == null) {
        throw new Error(`Couldn't find an app with domain ${domain}`);
    }
    await fetch(Fission.apiUrl(endpoints, `/app/${encodeURIComponent(appToDelete[0])}`), {
        method: "DELETE",
        headers: {
            "authorization": `Bearer ${jwt}`
        }
    });
}
/**
 * Updates an app by CID
 *
 * @param subdomain Subdomain to create the fission app with
 */
export async function publish(endpoints, dependencies, domain, cid) {
    const localUcan = await dependencies.reference.repositories.ucans.lookupAppUcan(domain);
    if (localUcan === null) {
        throw "Could not find your local UCAN";
    }
    const jwt = Ucan.encode(await Ucan.build({
        dependencies,
        audience: await Fission.did(endpoints),
        issuer: await DID.ucan(dependencies.crypto),
        proof: localUcan,
        potency: null
    }));
    const url = Fission.apiUrl(endpoints, `/app/${domain}/${cid}`);
    await fetch(url, {
        method: "PUT",
        headers: {
            "authorization": `Bearer ${jwt}`
        }
    });
}
//# sourceMappingURL=index.js.map