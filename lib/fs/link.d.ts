import { CID } from "multiformats/cid";
import { PBLink } from "@ipld/dag-pb";
import { HardLink, SimpleLink } from "./types.js";
declare type HasName = {
    name: string;
};
export declare const arrToMap: <T extends HasName>(arr: T[]) => {
    [name: string]: T;
};
export declare const fromDAGLink: (link: PBLink) => SimpleLink;
export declare const make: (name: string, cid: CID, isFile: boolean, size: number) => HardLink;
export declare const toDAGLink: (link: SimpleLink) => PBLink;
export {};
