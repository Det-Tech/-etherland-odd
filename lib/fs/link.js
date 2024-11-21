import * as DagPB from "@ipld/dag-pb";
import { decodeCID, encodeCID } from "../common/cid.js";
export const arrToMap = (arr) => {
    return arr.reduce((acc, cur) => {
        acc[cur.name] = cur;
        return acc;
    }, {});
};
export const fromDAGLink = (link) => {
    const name = link.Name || "";
    const cid = link.Hash;
    const size = link.Tsize || 0;
    return { name, cid, size };
};
export const make = (name, cid, isFile, size) => {
    return {
        name,
        cid: encodeCID(cid),
        size,
        isFile
    };
};
export const toDAGLink = (link) => {
    const { name, cid, size } = link;
    return DagPB.createLink(name, size, decodeCID(cid));
};
//# sourceMappingURL=link.js.map