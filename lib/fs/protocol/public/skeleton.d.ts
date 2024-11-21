import { Skeleton, SkeletonInfo } from "./types.js";
import { NonEmptyPath, SoftLink } from "../../types.js";
export declare const getPath: (skeleton: Skeleton, path: NonEmptyPath) => SkeletonInfo | SoftLink | null;
export declare function nextNonEmpty(parts: NonEmptyPath): NonEmptyPath | null;
