import { Implementation, ImplementationOptions } from "../implementation.js";
export declare function getItem<T>(db: LocalForage, key: string): Promise<T | null>;
export declare function setItem<T>(db: LocalForage, key: string, val: T): Promise<T>;
export declare function removeItem(db: LocalForage, key: string): Promise<void>;
export declare function clear(db: LocalForage): Promise<void>;
export declare function implementation({ name }: ImplementationOptions): Implementation;
