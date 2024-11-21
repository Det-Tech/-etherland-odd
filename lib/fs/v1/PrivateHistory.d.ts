import * as Crypto from "../../components/crypto/implementation.js";
import * as Depot from "../../components/depot/implementation.js";
import MMPT from "../protocol/private/mmpt.js";
import { BareNameFilter } from "../protocol/private/namefilter.js";
import { DecryptedNode, Revision } from "../protocol/private/types.js";
import { Maybe } from "../../common/index.js";
import { Metadata } from "../metadata.js";
export interface Node {
    fromInfo: (mmpt: MMPT, key: Uint8Array, info: DecryptedNode) => Promise<Node>;
    header: {
        bareNameFilter: BareNameFilter;
        metadata: Metadata;
        revision: number;
    };
    key: Uint8Array;
    mmpt: MMPT;
}
export default class PrivateHistory {
    readonly node: Node;
    crypto: Crypto.Implementation;
    depot: Depot.Implementation;
    constructor(crypto: Crypto.Implementation, depot: Depot.Implementation, node: Node);
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
    _getRevision(revision: number): Promise<Maybe<Node>>;
    /**
     * @internal
     */
    _getRevisionInfo(revision: Revision): Promise<DecryptedNode>;
    /**
     * @internal
     */
    _getRevisionInfoFromNumber(revision: number): Promise<Maybe<DecryptedNode>>;
    /**
     * @internal
     */
    _prior(revision: number, timestamp: number): Promise<Maybe<Node>>;
}
