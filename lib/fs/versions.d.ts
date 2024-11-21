import * as SemVer from "../common/semver.js";
export * from "../common/semver.js";
export declare const isSupported: (fsVersion: SemVer.SemVer) => true | "too-high" | "too-low";
export declare const v0: SemVer.SemVer;
export declare const v1: SemVer.SemVer;
export declare const latest: SemVer.SemVer;
export declare const wnfsWasm: SemVer.SemVer;
export declare const supported: SemVer.SemVer[];
