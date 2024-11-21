import { CID } from "multiformats/cid";
import { CodecIdentifier } from "../../dag/codecs.js";
export declare type Implementation = {
    getBlock: (cid: CID) => Promise<Uint8Array>;
    getUnixFile: (cid: CID) => Promise<Uint8Array>;
    getUnixDirectory: (cid: CID) => Promise<DirectoryItem[]>;
    putBlock: (data: Uint8Array, codec: CodecIdentifier) => Promise<CID>;
    putChunked: (data: Uint8Array) => Promise<PutResult>;
    size: (cid: CID) => Promise<number>;
};
export declare type DirectoryItem = {
    isFile: boolean;
    cid: CID;
    name: string;
    size: number;
};
export declare type PutResult = {
    cid: CID;
    size: number;
    isFile: boolean;
};
