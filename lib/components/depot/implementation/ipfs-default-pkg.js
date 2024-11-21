import * as Ipfs from "./ipfs/index.js";
import * as IpfsBase from "./ipfs.js";
// 🛳
export async function implementation(dependencies, peersUrl, repoName) {
    let instance = null;
    return IpfsBase.implementation(async () => {
        if (instance)
            return instance;
        instance = await Ipfs.nodeWithPkg(dependencies, await Ipfs.pkgFromCDN(Ipfs.DEFAULT_CDN_URL), peersUrl, repoName, false);
        return instance;
    });
}
//# sourceMappingURL=ipfs-default-pkg.js.map