import * as Crypto from "../../components/crypto/implementation.js";
import * as Depot from "../../components/depot/implementation.js";
import BaseFile from "../base/file.js";
import MMPT from "../protocol/private/mmpt.js";
import PrivateHistory from "./PrivateHistory.js";
import { PrivateName, BareNameFilter } from "../protocol/private/namefilter.js";
import { DecryptedNode, PrivateAddResult, PrivateFileInfo } from "../protocol/private/types.js";
import { Maybe } from "../../common/index.js";
declare type ConstructorParams = {
    crypto: Crypto.Implementation;
    depot: Depot.Implementation;
    content: Uint8Array;
    key: Uint8Array;
    header: PrivateFileInfo;
    mmpt: MMPT;
};
export declare class PrivateFile extends BaseFile {
    crypto: Crypto.Implementation;
    depot: Depot.Implementation;
    header: PrivateFileInfo;
    history: PrivateHistory;
    key: Uint8Array;
    mmpt: MMPT;
    constructor({ crypto, depot, content, mmpt, key, header }: ConstructorParams);
    static instanceOf(obj: unknown): obj is PrivateFile;
    static create(crypto: Crypto.Implementation, depot: Depot.Implementation, mmpt: MMPT, content: Uint8Array, parentNameFilter: BareNameFilter, key: Uint8Array): Promise<PrivateFile>;
    static fromBareNameFilter(crypto: Crypto.Implementation, depot: Depot.Implementation, mmpt: MMPT, bareNameFilter: BareNameFilter, key: Uint8Array): Promise<PrivateFile>;
    static fromLatestName(crypto: Crypto.Implementation, depot: Depot.Implementation, mmpt: MMPT, name: PrivateName, key: Uint8Array): Promise<PrivateFile>;
    static fromName(crypto: Crypto.Implementation, depot: Depot.Implementation, mmpt: MMPT, name: PrivateName, key: Uint8Array): Promise<PrivateFile>;
    static fromInfo(crypto: Crypto.Implementation, depot: Depot.Implementation, mmpt: MMPT, key: Uint8Array, info: Maybe<DecryptedNode>): Promise<PrivateFile>;
    getName(): Promise<PrivateName>;
    updateParentNameFilter(parentNameFilter: BareNameFilter): Promise<this>;
    updateContent(content: Uint8Array): Promise<this>;
    putDetailed(): Promise<PrivateAddResult>;
}
export default PrivateFile;
