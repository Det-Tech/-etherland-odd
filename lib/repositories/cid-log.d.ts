import { CID } from "multiformats/cid";
import * as Storage from "../components/storage/implementation";
import Repository from "../repository.js";
export declare function create({ storage }: {
    storage: Storage.Implementation;
}): Promise<Repo>;
export declare class Repo extends Repository<CID> {
    private constructor();
    fromJSON(a: string): CID;
    toJSON(a: CID): string;
    indexOf(item: CID): number;
    newest(): CID;
}
