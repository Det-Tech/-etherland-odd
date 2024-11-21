import * as Crypto from "../components/crypto/implementation.js";
import * as Depot from "../components/depot/implementation.js";
import * as Manners from "../components/manners/implementation.js";
import * as Reference from "../components/reference/implementation.js";
import * as Path from "../path/index.js";
import { SharedBy, ShareDetails } from "./types.js";
import PrivateFile from "./v1/PrivateFile.js";
import PrivateTree from "./v1/PrivateTree.js";
import RootTree from "./root/tree.js";
export declare const EXCHANGE_PATH: Path.Directory<Path.PartitionedNonEmpty<Path.Public>>;
export declare function privateNode(crypto: Crypto.Implementation, depot: Depot.Implementation, manners: Manners.Implementation, reference: Reference.Implementation, rootTree: RootTree, items: Array<[string, PrivateTree | PrivateFile]>, { shareWith, sharedBy }: {
    shareWith: string | string[];
    sharedBy: SharedBy;
}): Promise<ShareDetails>;
export declare function listExchangeDIDs(depot: Depot.Implementation, reference: Reference.Implementation, username: string): Promise<string[]>;
