import * as Depot from "../../components/depot/implementation.js";
export interface BlockStore {
    putBlock(bytes: Uint8Array, code: number): Promise<Uint8Array>;
    getBlock(cid: Uint8Array): Promise<Uint8Array | undefined>;
}
export declare class DepotBlockStore implements BlockStore {
    private depot;
    constructor(depot: Depot.Implementation);
    /** Retrieves an array of bytes from the block store with given CID. */
    getBlock(cid: Uint8Array): Promise<Uint8Array | undefined>;
    /** Stores an array of bytes in the block store. */
    putBlock(bytes: Uint8Array, code: number): Promise<Uint8Array>;
}
