import type { CID } from "multiformats/cid";
import * as Depot from "../../../components/depot/implementation.js";
import { Puttable, SimpleLinks } from "../../types.js";
declare type Member = {
    name: string;
    cid: CID;
};
/**
 * Modified Merkle Patricia Tree
 * The tree has a node weight of 16
 * It stores items with hexidecimal keys and creates a new layer when a given layer has two keys that start with the same nibble
 */
export default class MMPT implements Puttable {
    depot: Depot.Implementation;
    links: SimpleLinks;
    children: {
        [name: string]: MMPT;
    };
    constructor(depot: Depot.Implementation, links: SimpleLinks);
    static create(depot: Depot.Implementation): MMPT;
    static fromCID(depot: Depot.Implementation, cid: CID): Promise<MMPT>;
    putDetailed(): Promise<Depot.PutResult>;
    put(): Promise<CID>;
    add(name: string, value: CID): Promise<void>;
    putAndUpdateChildLink(name: string): Promise<void>;
    addEmptyChild(name: string): MMPT;
    get(name: string): Promise<CID | null>;
    exists(name: string): Promise<boolean>;
    members(): Promise<Array<Member>>;
    private getDirectChild;
    private removeChild;
    private directChildExists;
    private nextTreeName;
    private nextTreeOrSiblingName;
}
export {};
