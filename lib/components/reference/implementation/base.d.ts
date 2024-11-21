import { Implementation } from "../implementation";
import * as Crypto from "../../../components/crypto/implementation.js";
import * as Manners from "../../../components/manners/implementation.js";
import * as Storage from "../../../components/storage/implementation.js";
export declare type Dependencies = {
    crypto: Crypto.Implementation;
    manners: Manners.Implementation;
    storage: Storage.Implementation;
};
export declare function didRootLookup(dependencies: Dependencies, username: string): Promise<string>;
export declare function implementation(dependencies: Dependencies): Promise<Implementation>;
