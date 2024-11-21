import { decodeCID } from "../common/cid.js";
import Repository from "../repository.js";
export function create({ storage }) {
    return Repo.create({
        storage,
        storageName: storage.KEYS.CID_LOG
    });
}
// CLASS
export class Repo extends Repository {
    constructor(options) {
        super(options);
    }
    fromJSON(a) {
        return decodeCID(a);
    }
    toJSON(a) {
        return a.toString();
    }
    indexOf(item) {
        return this.memoryCache.map(c => c.toString()).indexOf(item.toString());
    }
    newest() {
        return this.memoryCache[this.memoryCache.length - 1];
    }
}
//# sourceMappingURL=cid-log.js.map