import type { IPFS as IPFSCore } from "ipfs-core-types";
import type { IPFSRepo } from "ipfs-repo";
import type { PeerId } from "@libp2p/interface-peer-id";
import { Multiaddr } from "@multiformats/multiaddr";
import * as Storage from "../../../../components/storage/implementation.js";
import { IPFSPackage, Options as IPFSOptions } from "./package.js";
export declare type BackOff = {
    retryNumber: number;
    lastBackoff: number;
    currentBackoff: number;
};
export declare type Dependencies = {
    storage: Storage.Implementation;
};
export declare type Status = {
    connected: boolean;
    lastConnectedAt: number | null;
    latency: number | null;
};
export declare type IPFS = IPFSCore & {
    libp2p: {
        ping(peerId: PeerId | Multiaddr): Promise<number>;
    };
};
/** 🎛️ IPFS Options
 */
export declare const OPTIONS: IPFSOptions;
export declare function createAndConnect(dependencies: Dependencies, pkg: IPFSPackage, peersUrl: string, repoName: string, logging: boolean): Promise<{
    ipfs: IPFSCore;
    repo: IPFSRepo;
}>;
export declare function fetchPeers(peersUrl: string): Promise<string[]>;
export declare function listPeers(storage: Storage.Implementation, peersUrl: string): Promise<Multiaddr[]>;
export declare function tryConnecting(ipfs: IPFS, peer: Multiaddr, logging: boolean): void;
export declare function ping(ipfs: IPFS, peer: Multiaddr): Promise<{
    latency: number;
}>;
export declare function monitorPeers(): Promise<void>;
export declare function stopMonitoringPeers(): void;
export declare function monitorBitswap(dependencies: Dependencies, ipfs: IPFS, peersUrl: string, verbose: boolean): Promise<void>;
export declare function stopMonitoringBitswap(): Promise<void>;
