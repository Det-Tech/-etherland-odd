import * as Crypto from "../../../components/crypto/implementation.js";
import type { BareNameFilter, SaturatedNameFilter } from "../private/namefilter.js";
import type { ShareKey } from "./key.js";
export declare function namefilter(crypto: Crypto.Implementation, { bareFilter, shareKey }: {
    bareFilter: BareNameFilter;
    shareKey: ShareKey;
}): Promise<SaturatedNameFilter>;
