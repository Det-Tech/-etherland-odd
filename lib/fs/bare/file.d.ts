import type { CID } from "multiformats/cid";
import * as Depot from "../../components/depot/implementation.js";
import { PutResult } from "../../components/depot/implementation.js";
import BaseFile from "../base/file.js";
export declare class BareFile extends BaseFile {
    depot: Depot.Implementation;
    constructor(depot: Depot.Implementation, content: Uint8Array);
    static create(depot: Depot.Implementation, content: Uint8Array): BareFile;
    static fromCID(depot: Depot.Implementation, cid: CID): Promise<BareFile>;
    static instanceOf(obj: unknown): obj is BareFile;
    put(): Promise<CID>;
    putDetailed(): Promise<PutResult>;
}
export default BareFile;
