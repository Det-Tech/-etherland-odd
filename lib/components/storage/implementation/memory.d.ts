import { Implementation } from "../implementation.js";
export declare function getItem<T>(mem: Record<string, T>, key: string): Promise<T | null>;
export declare function setItem<T>(mem: Record<string, T>, key: string, val: T): Promise<T>;
export declare function removeItem<T>(mem: Record<string, T>, key: string): Promise<void>;
export declare function clear<T>(mem: Record<string, T>): Promise<void>;
export declare function implementation(): Implementation;
