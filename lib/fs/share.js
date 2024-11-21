import * as DagCBOR from "@ipld/dag-cbor";
import * as Uint8arrays from "uint8arrays";
import * as Path from "../path/index.js";
import * as Basic from "./protocol/basic.js";
import * as Protocol from "./protocol/index.js";
import * as EntryIndex from "./protocol/shared/entry-index.js";
import * as ShareKey from "./protocol/shared/key.js";
import { RootBranch } from "../path/index.js";
import { SymmAlg } from "../components/crypto/implementation.js";
import { decodeCID, encodeCID } from "../common/cid.js";
import { didToPublicKey } from "../did/transformers.js";
import BareTree from "./bare/tree.js";
import PrivateTree from "./v1/PrivateTree.js";
// CONSTANTS
export const EXCHANGE_PATH = Path.directory("public", ".well-known", "exchange");
// FUNCTIONS
export async function privateNode(crypto, depot, manners, reference, rootTree, items, { shareWith, sharedBy }) {
    const exchangeDIDs = Array.isArray(shareWith)
        ? shareWith
        : shareWith.startsWith("did:")
            ? [shareWith]
            : await listExchangeDIDs(depot, reference, shareWith);
    const counter = rootTree.sharedCounter || 1;
    const mmpt = rootTree.mmpt;
    // Create share keys
    const shareKeysWithDIDs = await Promise.all(exchangeDIDs.map(async (did) => {
        return [
            did,
            await ShareKey.create(crypto, {
                counter,
                recipientExchangeDid: did,
                senderRootDid: sharedBy.rootDid
            })
        ];
    }));
    // Create entry index
    const indexKey = await crypto.aes.genKey(SymmAlg.AES_GCM).then(crypto.aes.exportKey);
    const index = await PrivateTree.create(crypto, depot, manners, reference, mmpt, indexKey, null);
    await Promise.all(items.map(async ([name, item]) => {
        const privateName = await item.getName();
        return index.insertSoftLink({
            key: item.key,
            name,
            privateName,
            username: sharedBy.username
        });
    }));
    // Add entry index to depot
    const symmKeyAlgo = SymmAlg.AES_GCM;
    const indexNode = Object.assign({}, index.header);
    const indexResult = await Basic.putFile(depot, await crypto.aes.encrypt(Uint8arrays.fromString(JSON.stringify(indexNode), "utf8"), index.key, symmKeyAlgo));
    // Add entry index CID to MMPT
    if (shareKeysWithDIDs.length) {
        const namefilter = await EntryIndex.namefilter(crypto, {
            bareFilter: indexNode.bareNameFilter,
            shareKey: shareKeysWithDIDs[0][1]
        });
        await mmpt.add(namefilter, indexResult.cid);
    }
    // Create share payload
    const payload = DagCBOR.encode(ShareKey.payload({
        entryIndexCid: encodeCID(indexResult.cid),
        symmKey: index.key,
        symmKeyAlgo
    }));
    // Add encrypted payloads to depot
    const links = await Promise.all(shareKeysWithDIDs.map(async ([did, shareKey]) => {
        const { publicKey } = didToPublicKey(crypto, did);
        const encryptedPayload = await crypto.rsa.encrypt(payload, publicKey);
        const result = await depot.putChunked(encryptedPayload);
        return {
            name: shareKey,
            cid: result.cid,
            size: result.size
        };
    }));
    // Add shares to filesystem
    await rootTree.addShares(links);
    // Fin
    return { shareId: counter.toString(), sharedBy };
}
export async function listExchangeDIDs(depot, reference, username) {
    const root = await reference.dataRoot.lookup(username);
    if (!root)
        throw new Error("This person doesn't have a filesystem yet.");
    const rootLinks = await Protocol.basic.getSimpleLinks(depot, root);
    const prettyTreeCid = rootLinks[RootBranch.Pretty]?.cid || null;
    if (!prettyTreeCid)
        throw new Error("This person's filesystem doesn't have a pretty tree.");
    const tree = await BareTree.fromCID(depot, decodeCID(prettyTreeCid));
    const exchangePath = Path.unwrap(Path.removePartition(EXCHANGE_PATH));
    const exchangeTree = await tree.get(exchangePath);
    return exchangeTree && exchangeTree instanceof BareTree
        ? Object.keys(exchangeTree.getLinks())
        : [];
}
//# sourceMappingURL=share.js.map