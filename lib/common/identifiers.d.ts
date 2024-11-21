import { DistinctivePath } from "../path/index.js";
import * as Crypto from "../components/crypto/implementation.js";
import * as Path from "../path/index.js";
declare type Arguments = {
    crypto: Crypto.Implementation;
    accountDID: string;
    path: DistinctivePath<Path.Segments>;
};
export declare function bareNameFilter({ crypto, accountDID, path }: Arguments): Promise<string>;
export declare function readKey({ crypto, accountDID, path }: Arguments): Promise<string>;
export {};
