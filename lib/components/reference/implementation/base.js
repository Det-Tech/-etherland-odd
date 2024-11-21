import * as CIDLogRepo from "../../../repositories/cid-log.js";
import * as UcansRepo from "../../../repositories/ucans.js";
import * as DID from "../../../did/index.js";
import * as DOH from "../dns-over-https.js";
import * as Ucan from "../../../ucan/index.js";
// 🛠
export async function didRootLookup(dependencies, username) {
    const maybeUcan = await dependencies.storage.getItem(dependencies.storage.KEYS.ACCOUNT_UCAN);
    return maybeUcan ? Ucan.rootIssuer(maybeUcan) : await DID.write(dependencies.crypto);
}
// 🛳
export async function implementation(dependencies) {
    return {
        dataRoot: {
            domain: () => { throw new Error("Not implemented"); },
            lookup: () => { throw new Error("Not implemented"); },
            update: () => { throw new Error("Not implemented"); }
        },
        didRoot: {
            lookup: (...args) => didRootLookup(dependencies, ...args)
        },
        dns: {
            lookupDnsLink: DOH.lookupDnsLink,
            lookupTxtRecord: DOH.lookupTxtRecord,
        },
        repositories: {
            cidLog: await CIDLogRepo.create({ storage: dependencies.storage }),
            ucans: await UcansRepo.create({ storage: dependencies.storage })
        },
    };
}
//# sourceMappingURL=base.js.map