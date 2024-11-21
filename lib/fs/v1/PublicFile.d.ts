import type { CID } from "multiformats/cid";
import * as Depot from "../../components/depot/implementation.js";
import { FileInfo, FileHeader, PutDetails } from "../protocol/public/types.js";
import { Maybe } from "../../common/index.js";
import BaseFile from "../base/file.js";
import PublicHistory from "./PublicHistory.js";
declare type ConstructorParams = {
    depot: Depot.Implementation;
    cid: Maybe<CID>;
    content: Uint8Array;
    header: FileHeader;
};
export declare class PublicFile extends BaseFile {
    depot: Depot.Implementation;
    cid: Maybe<CID>;
    header: FileHeader;
    history: PublicHistory;
    constructor({ depot, content, header, cid }: ConstructorParams);
    static instanceOf(obj: unknown): obj is PublicFile;
    static create(depot: Depot.Implementation, content: Uint8Array): Promise<PublicFile>;
    static fromCID(depot: Depot.Implementation, cid: CID): Promise<PublicFile>;
    static fromInfo(depot: Depot.Implementation, info: FileInfo, cid: CID): Promise<PublicFile>;
    putDetailed(): Promise<PutDetails>;
}
export default PublicFile;
