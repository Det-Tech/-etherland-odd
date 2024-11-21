export declare type Maybe<T> = T | null;
export declare type Opaque<K, T> = T & {
    __TYPE__: K;
};
export declare type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
