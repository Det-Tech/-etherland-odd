import * as Path from "../path/index.js";
import * as Storage from "../components/storage/implementation";
import * as Ucan from "../ucan/index.js";
import Repository from "../repository.js";
import { DistinctivePath } from "../path/index.js";
import { Resource } from "../ucan/index.js";
export declare function create({ storage }: {
    storage: Storage.Implementation;
}): Promise<Repo>;
export declare class Repo extends Repository<Ucan.Ucan> {
    private constructor();
    fromJSON(a: string): Ucan.Ucan;
    toJSON(a: Ucan.Ucan): string;
    toDictionary(items: Ucan.Ucan[]): {};
    /**
     * Look up a UCAN with a file system path.
     */
    lookupFilesystemUcan(path: DistinctivePath<Path.Segments> | "*"): Promise<Ucan.Ucan | null>;
    /**
     * Look up a UCAN for a platform app.
     */
    lookupAppUcan(domain: string): Promise<Ucan.Ucan | null>;
}
export declare const WNFS_PREFIX = "wnfs";
/**
 * Construct the prefix for a filesystem key.
 */
export declare function filesystemPrefix(username?: string): string;
/**
 * Creates the label for a given resource.
 */
export declare function resourceLabel(rsc: Resource): string;
