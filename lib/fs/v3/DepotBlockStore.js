import { CID } from "multiformats/cid";
import * as Codecs from "../../dag/codecs.js";
export class DepotBlockStore {
    constructor(depot) {
        this.depot = depot;
    }
    /** Retrieves an array of bytes from the block store with given CID. */
    async getBlock(cid) {
        const decodedCid = CID.decode(cid);
        return await this.depot.getBlock(decodedCid);
    }
    /** Stores an array of bytes in the block store. */
    async putBlock(bytes, code) {
        if (!Codecs.isIdentifier(code))
            throw new Error(`No codec was registered for the code: ${Codecs.numberHex(code)}`);
        const cid = await this.depot.putBlock(bytes, code);
        return cid.bytes;
    }
}
//# sourceMappingURL=DepotBlockStore.js.map