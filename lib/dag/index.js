import * as DagCBOR from "@ipld/dag-cbor";
import * as DagPB from "@ipld/dag-pb";
import * as Codecs from "./codecs.js";
// CONSTANTS
// These bytes in the "data" field of a DAG-PB node indicate that the node is an IPLD DAG Node
export const PB_IPLD_DATA = new Uint8Array([8, 1]);
// BYTES
export function fromBytes(storeCodecId, bytes) {
    const storeCodec = Codecs.getByIdentifier(storeCodecId);
    return storeCodec.decode(bytes);
}
export function toBytes(storeCodecId, dagNode) {
    const storeCodec = Codecs.getByIdentifier(storeCodecId);
    return storeCodec.encode(dagNode);
}
// GET
export async function get(depot, cid) {
    const codec = Codecs.getByCode(cid.code);
    return codec.decode(await depot.getBlock(cid));
}
export async function getCBOR(depot, cid) {
    Codecs.expect(DagCBOR.code, cid);
    return DagCBOR.decode(await depot.getBlock(cid));
}
export async function getPB(depot, cid) {
    Codecs.expect(DagPB.code, cid);
    return DagPB.decode(await depot.getBlock(cid));
}
// PUT
export function putPB(depot, links) {
    const node = DagPB.createNode(PB_IPLD_DATA, links);
    return depot.putBlock(DagPB.encode(node), DagPB.code);
}
//# sourceMappingURL=index.js.map