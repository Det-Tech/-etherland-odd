import type { IPFS } from "ipfs-core-types";
import type { IPFSRepo } from "ipfs-repo";
import { Implementation } from "../implementation.js";
export declare function implementation(getIpfs: () => Promise<{
    ipfs: IPFS;
    repo: IPFSRepo;
}>): Promise<Implementation>;
