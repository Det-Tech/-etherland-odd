import * as dagCBOR from "@ipld/dag-cbor";
import * as dagPB from "@ipld/dag-pb";
import * as raw from "multiformats/codecs/raw";
import { createRepo } from "ipfs-repo";
import { BlockstoreDatastoreAdapter } from "blockstore-datastore-adapter";
import { MemoryDatastore } from "datastore-core/memory";
import { LevelDatastore } from "datastore-level";
export function create(repoName) {
    const memoryDs = new MemoryDatastore();
    return createRepo(repoName, codeOrName => {
        const lookup = {
            [dagPB.code]: dagPB,
            [dagPB.name]: dagPB,
            [dagCBOR.code]: dagCBOR,
            [dagCBOR.name]: dagCBOR,
            [raw.code]: raw,
            [raw.name]: raw,
        };
        return Promise.resolve(lookup[codeOrName]);
    }, {
        root: new LevelDatastore(`${repoName}/root`, { prefix: "", version: 2 }),
        blocks: new BlockstoreDatastoreAdapter(new LevelDatastore(`${repoName}/blocks`, { prefix: "", version: 2 })),
        keys: new LevelDatastore(`${repoName}/keys`, { prefix: "", version: 2 }),
        datastore: memoryDs,
        pins: new LevelDatastore(`${repoName}/pins`, { prefix: "", version: 2 }),
    }, {
        repoLock: {
            lock: async () => ({ close: async () => { return; } }),
            locked: async () => false
        },
        autoMigrate: false,
    });
}
//# sourceMappingURL=repo.js.map