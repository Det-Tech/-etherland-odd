import type { CID } from "multiformats/cid";
import { Maybe } from "../../common/index.js";
import { FileHeader } from "../protocol/public/types.js";
export declare type Node = {
    fromCID: (cid: CID) => Promise<Node>;
    header: Pick<FileHeader, "metadata" | "previous">;
};
export default class PublicHistory {
    readonly node: Node;
    constructor(node: Node);
    /**
     * Go back one or more versions.
     *
     * @param delta Optional negative number to specify how far to go back
     */
    back(delta?: number): Promise<Maybe<Node>>;
    /**
     * Get a version before a given timestamp.
     *
     * @param timestamp Unix timestamp in seconds
     */
    prior(timestamp: number): Promise<Maybe<Node>>;
    /**
     * List earlier versions along with the timestamp they were created.
     */
    list(amount?: number): Promise<Array<{
        delta: number;
        timestamp: number;
    }>>;
    /**
     * @internal
     */
    static _getPreviousVersion(node: Node): Promise<Maybe<Node>>;
    /**
     * @internal
     */
    static _prior(node: Node, timestamp: number): Promise<Maybe<Node>>;
}
