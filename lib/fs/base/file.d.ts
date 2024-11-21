import type { CID } from "multiformats/cid";
import { File } from "../types.js";
import { PutResult } from "../../components/depot/implementation.js";
export declare abstract class BaseFile implements File {
    content: Uint8Array;
    readOnly: boolean;
    constructor(content: Uint8Array);
    put(): Promise<CID>;
    updateContent(content: Uint8Array): Promise<this>;
    abstract putDetailed(): Promise<PutResult>;
}
export default BaseFile;
