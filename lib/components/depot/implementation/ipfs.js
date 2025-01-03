import * as uint8arrays from "uint8arrays";
import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import * as Codecs from "../../../dag/codecs.js";
// 🛳
export async function implementation(getIpfs) {
    return {
        // GET
        getBlock: async (cid) => {
            const { ipfs } = await getIpfs();
            return ipfs.block.get(cid);
        },
        getUnixDirectory: async (cid) => {
            const { ipfs } = await getIpfs();
            const entries = [];
            for await (const entry of ipfs.ls(cid)) {
                const { name = "", cid, size, type } = entry;
                entries.push({
                    name,
                    cid: cid,
                    size,
                    isFile: type !== "dir"
                });
            }
            return entries;
        },
        getUnixFile: async (cid) => {
            const { ipfs } = await getIpfs();
            const chunks = [];
            for await (const chunk of ipfs.cat(cid)) {
                chunks.push(chunk);
            }
            return uint8arrays.concat(chunks);
        },
        // PUT
        putBlock: async (data, codecId) => {
            const { repo } = await getIpfs();
            const codec = Codecs.getByIdentifier(codecId);
            const multihash = await sha256.digest(data);
            const cid = CID.createV1(codec.code, multihash);
            await repo.blocks.put(cid, data);
            return cid;
        },
        putChunked: async (data) => {
            const { ipfs } = await getIpfs();
            const addResult = await ipfs.add(data, {
                cidVersion: 1,
                hashAlg: "sha2-256",
                rawLeaves: true,
                wrapWithDirectory: false,
                preload: false,
                pin: false,
            });
            return { ...addResult, isFile: true };
        },
        // STATS
        size: async (cid) => {
            const { ipfs } = await getIpfs();
            const stat = await ipfs.files.stat(`/ipfs/${cid}`);
            return stat.cumulativeSize;
        }
    };
}
//# sourceMappingURL=ipfs.js.map