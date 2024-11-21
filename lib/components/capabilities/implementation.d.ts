import { Capabilities } from "../../capabilities.js";
import { Maybe } from "../../common/types.js";
import { Permissions } from "../../permissions.js";
export declare type RequestOptions = {
    extraParams?: Record<string, string>;
    permissions?: Permissions;
    returnUrl?: string;
};
export declare type Implementation = {
    collect: () => Promise<Maybe<Capabilities>>;
    request: (options: RequestOptions) => Promise<void>;
};
