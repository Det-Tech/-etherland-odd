import * as Storage from "./components/storage/implementation";
export declare type RepositoryOptions = {
    storage: Storage.Implementation;
    storageName: string;
};
export default abstract class Repository<T> {
    dictionary: Record<string, T>;
    memoryCache: T[];
    storage: Storage.Implementation;
    storageName: string;
    constructor({ storage, storageName }: RepositoryOptions);
    static create<T>(options: RepositoryOptions): Promise<any>;
    add(itemOrItems: T | T[]): Promise<void>;
    clear(): Promise<void>;
    find(predicate: (value: T, index: number) => boolean): T | null;
    getByIndex(idx: number): T | null;
    getAll(): Promise<T[]>;
    indexOf(item: T): number;
    length(): number;
    fromJSON(a: string): T;
    toJSON(a: T): string;
    getByKey(key: string): T | null;
    toDictionary(items: T[]): Record<string, T>;
}
