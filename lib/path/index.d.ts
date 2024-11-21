import { AppInfo } from "../appInfo.js";
import { Maybe } from "../common/types.js";
export declare enum RootBranch {
    Public = "public",
    Pretty = "p",
    Private = "private",
    PrivateLog = "privateLog",
    Shared = "shared",
    SharedCounter = "sharedCounter",
    Version = "version"
}
export declare enum Kind {
    Directory = "directory",
    File = "file"
}
export declare type Segment = string;
export declare type Segments = Segment[];
export declare type SegmentsNonEmpty = [Segment, ...Segments];
export declare type Partitioned<P> = [P, ...Segments];
export declare type PartitionedNonEmpty<P> = [P, Segment, ...Segments];
/**
 * Private partition
 */
export declare type Private = "private" | RootBranch.Private;
/**
 * Public partition
 */
export declare type Public = "public" | RootBranch.Public;
/**
 * `RootBranch`es that are accessible through the POSIX file system interface.
 */
export declare type Partition = Private | Public;
/**
 * A directory path.
 */
export declare type DirectoryPath<P> = {
    directory: P;
};
/**
 * A file path.
 */
export declare type FilePath<P> = {
    file: P;
};
/**
 * A file or directory path.
 */
export declare type DistinctivePath<P> = DirectoryPath<P> | FilePath<P>;
/**
 * Alias for `DirectoryPath`
 */
export declare type Directory<P> = DirectoryPath<P>;
/**
 * Alias for `FilePath`
 */
export declare type File<P> = FilePath<P>;
/**
 * Alias for `DistinctivePath`
 */
export declare type Distinctive<P> = DistinctivePath<P>;
/**
 * Utility function to create a `DirectoryPath`
 */
export declare function directory<P extends Partition>(...args: PartitionedNonEmpty<P>): DirectoryPath<PartitionedNonEmpty<P>>;
export declare function directory<P extends Partition>(...args: Partitioned<P>): DirectoryPath<Partitioned<P>>;
export declare function directory(...args: SegmentsNonEmpty): DirectoryPath<SegmentsNonEmpty>;
export declare function directory(...args: Segments): DirectoryPath<Segments>;
/**
 * Utility function to create a `FilePath`
 */
export declare function file<P extends Partition>(...args: PartitionedNonEmpty<P>): FilePath<PartitionedNonEmpty<P>>;
export declare function file(...args: SegmentsNonEmpty): FilePath<SegmentsNonEmpty>;
export declare function file(...args: Segments): FilePath<Segments>;
/**
 * Utility function to create a root `DirectoryPath`
 */
export declare function root(): DirectoryPath<Segments>;
/**
 * Utility function create an app data path.
 */
export declare function appData(app: AppInfo): DirectoryPath<PartitionedNonEmpty<Private>>;
export declare function appData(app: AppInfo, suffix: FilePath<Segments>): FilePath<PartitionedNonEmpty<Private>>;
export declare function appData(app: AppInfo, suffix: DirectoryPath<Segments>): DirectoryPath<PartitionedNonEmpty<Private>>;
export declare function appData(app: AppInfo, suffix: DistinctivePath<Segments>): DistinctivePath<PartitionedNonEmpty<Private>>;
/**
 * Transform a string into a `DistinctivePath`.
 *
 * Directories should have the format `path/to/dir/` and
 * files should have the format `path/to/file`.
 *
 * Leading forward slashes are removed too, so you can pass absolute paths.
 */
export declare function fromPosix(path: string): DistinctivePath<Segments>;
/**
 * Transform a `DistinctivePath` into a string.
 *
 * Directories will have the format `path/to/dir/` and
 * files will have the format `path/to/file`.
 */
export declare function toPosix(path: DistinctivePath<Segments>, { absolute }?: {
    absolute: boolean;
}): string;
/**
 * Combine two `DistinctivePath`s.
 */
export declare function combine<P extends Partition>(a: DirectoryPath<PartitionedNonEmpty<P>>, b: FilePath<Segments>): FilePath<PartitionedNonEmpty<P>>;
export declare function combine<P extends Partition>(a: DirectoryPath<Partitioned<P>>, b: FilePath<SegmentsNonEmpty>): FilePath<PartitionedNonEmpty<P>>;
export declare function combine<P extends Partition>(a: DirectoryPath<Partitioned<P>>, b: FilePath<Segments>): FilePath<Partitioned<P>>;
export declare function combine(a: DirectoryPath<Segments>, b: FilePath<Segments>): FilePath<Segments>;
export declare function combine<P extends Partition>(a: DirectoryPath<PartitionedNonEmpty<P>>, b: DirectoryPath<Segments>): DirectoryPath<PartitionedNonEmpty<P>>;
export declare function combine<P extends Partition>(a: DirectoryPath<Partitioned<P>>, b: DirectoryPath<SegmentsNonEmpty>): DirectoryPath<PartitionedNonEmpty<P>>;
export declare function combine<P extends Partition>(a: DirectoryPath<Partitioned<P>>, b: DirectoryPath<Segments>): DirectoryPath<Partitioned<P>>;
export declare function combine(a: DirectoryPath<Segments>, b: DirectoryPath<Segments>): DirectoryPath<Segments>;
export declare function combine<P extends Partition>(a: DirectoryPath<PartitionedNonEmpty<P>>, b: DistinctivePath<Segments>): DistinctivePath<PartitionedNonEmpty<P>>;
export declare function combine<P extends Partition>(a: DirectoryPath<Partitioned<P>>, b: DistinctivePath<SegmentsNonEmpty>): DistinctivePath<PartitionedNonEmpty<P>>;
export declare function combine<P extends Partition>(a: DirectoryPath<Partitioned<P>>, b: DistinctivePath<Segments>): DistinctivePath<Partitioned<P>>;
export declare function combine(a: DirectoryPath<Segments>, b: DistinctivePath<Segments>): DistinctivePath<Segments>;
/**
 * Is this `DistinctivePath` a directory?
 */
export declare function isDirectory<P>(path: DistinctivePath<P>): path is DirectoryPath<P>;
/**
 * Is this `DistinctivePath` a file?
 */
export declare function isFile<P>(path: DistinctivePath<P>): path is FilePath<P>;
/**
 * Is this `DistinctivePath` of the given `Partition`?
 */
export declare function isPartition(partition: Partition, path: DistinctivePath<Segments>): boolean;
/**
 * Is this `DistinctivePath` on the given `RootBranch`?
 */
export declare function isOnRootBranch(rootBranch: RootBranch, path: DistinctivePath<Segments>): boolean;
/**
 * Is this `DirectoryPath` a root directory?
 */
export declare function isRootDirectory(path: DirectoryPath<Segments>): boolean;
/**
 * Check if two `DistinctivePath` have the same `Partition`.
 */
export declare function isSamePartition(a: DistinctivePath<Segments>, b: DistinctivePath<Segments>): boolean;
/**
 * Check if two `DistinctivePath` are of the same kind.
 */
export declare function isSameKind(a: DistinctivePath<Segments>, b: DistinctivePath<Segments>): boolean;
/**
 * What `Kind` of path are we dealing with?
 */
export declare function kind(path: DistinctivePath<Segments>): Kind;
/**
 * Map a `DistinctivePath`.
 */
export declare function map<A, B>(fn: (p: A) => B, path: DistinctivePath<A>): DistinctivePath<B>;
/**
 * Get the parent directory of a `DistinctivePath`.
 */
export declare function parent(path: DistinctivePath<[Partition, Segment, Segment, ...Segments]>): DirectoryPath<PartitionedNonEmpty<Partition>>;
export declare function parent(path: DistinctivePath<[Segment, Segment, Segment, ...Segments]>): DirectoryPath<SegmentsNonEmpty>;
export declare function parent(path: DistinctivePath<PartitionedNonEmpty<Partition>>): DirectoryPath<Partitioned<Partition>>;
export declare function parent(path: DistinctivePath<[Partition, Segment]>): DirectoryPath<Partitioned<Partition>>;
export declare function parent(path: DistinctivePath<Partitioned<Partition>>): DirectoryPath<Segments>;
export declare function parent(path: DistinctivePath<SegmentsNonEmpty>): DirectoryPath<Segments>;
export declare function parent(path: DistinctivePath<[Segment]>): DirectoryPath<[]>;
export declare function parent(path: DistinctivePath<[]>): null;
export declare function parent(path: DistinctivePath<Segments>): Maybe<DirectoryPath<Segments>>;
/**
 * Remove the `Partition` of a `DistinctivePath` (ie. the top-level directory)
 */
export declare function removePartition(path: DistinctivePath<Segments>): DistinctivePath<Segments>;
/**
 * Get the last part of the path.
 */
export declare function terminus(path: DistinctivePath<Segments>): Maybe<string>;
/**
 * Unwrap a `DistinctivePath`.
 */
export declare function unwrap<P>(path: DistinctivePath<P>): P;
/**
 * Utility function to prefix a path with a `Partition`.
 */
export declare function withPartition<P extends Partition>(partition: P, path: DirectoryPath<SegmentsNonEmpty>): DirectoryPath<PartitionedNonEmpty<P>>;
export declare function withPartition<P extends Partition>(partition: P, path: DirectoryPath<Segments>): DirectoryPath<Partitioned<P>>;
export declare function withPartition<P extends Partition>(partition: P, path: FilePath<SegmentsNonEmpty>): FilePath<PartitionedNonEmpty<P>>;
export declare function withPartition<P extends Partition>(partition: P, path: FilePath<Segments>): FilePath<Partitioned<P>>;
export declare function withPartition<P extends Partition>(partition: P, path: DistinctivePath<SegmentsNonEmpty>): DistinctivePath<PartitionedNonEmpty<P>>;
export declare function withPartition<P extends Partition>(partition: P, path: DistinctivePath<Segments>): DistinctivePath<Partitioned<P>>;
/**
 * Render a raw `Path` to a string for logging purposes.
 */
export declare function log(path: Segments): string;
