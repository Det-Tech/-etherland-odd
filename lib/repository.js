import * as TypeChecks from "./common/type-checks.js";
export default class Repository {
    constructor({ storage, storageName }) {
        this.memoryCache = [];
        this.dictionary = {};
        this.storage = storage;
        this.storageName = storageName;
    }
    static async create(options) {
        // @ts-ignore
        const repo = new this.prototype.constructor(options);
        repo.memoryCache = await repo.getAll();
        repo.dictionary = repo.toDictionary(repo.memoryCache);
        return repo;
    }
    async add(itemOrItems) {
        const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
        this.memoryCache = [...this.memoryCache, ...items];
        this.dictionary = this.toDictionary(this.memoryCache);
        await this.storage.setItem(this.storageName, 
        // TODO: JSON.stringify(this.memoryCache.map(this.toJSON))
        this.memoryCache.map(this.toJSON).join("|||"));
    }
    clear() {
        this.memoryCache = [];
        this.dictionary = {};
        return this.storage.removeItem(this.storageName);
    }
    find(predicate) {
        return this.memoryCache.find(predicate) || null;
    }
    getByIndex(idx) {
        return this.memoryCache[idx];
    }
    async getAll() {
        const storage = await this.storage.getItem(this.storageName);
        const storedItems = TypeChecks.isString(storage)
            // TODO: ? - Need partial JSON decoding for this
            ? storage.split("|||").map(this.fromJSON)
            : [];
        return storedItems;
    }
    indexOf(item) {
        return this.memoryCache.indexOf(item);
    }
    length() {
        return this.memoryCache.length;
    }
    // ENCODING
    fromJSON(a) {
        return JSON.parse(a);
    }
    toJSON(a) {
        return JSON.stringify(a);
    }
    // DICTIONARY
    getByKey(key) {
        return this.dictionary[key];
    }
    toDictionary(items) {
        return items.reduce((acc, value, idx) => ({ ...acc, [idx.toString()]: value }), {});
    }
}
//# sourceMappingURL=repository.js.map