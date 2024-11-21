export declare type SemVer = {
    major: number;
    minor: number;
    patch: number;
};
export declare const encode: (major: number, minor: number, patch: number) => SemVer;
export declare const fromString: (str: string) => SemVer | null;
export declare const toString: (version: SemVer) => string;
export declare const equals: (a: SemVer, b: SemVer) => boolean;
export declare const isSmallerThan: (a: SemVer, b: SemVer) => boolean;
export declare const isBiggerThan: (a: SemVer, b: SemVer) => boolean;
export declare function isBiggerThanOrEqualTo(a: SemVer, b: SemVer): boolean;
