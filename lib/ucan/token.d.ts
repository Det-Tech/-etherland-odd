import * as Crypto from "../components/crypto/implementation.js";
import { Potency, Fact, Resource, Ucan, UcanHeader, UcanPayload } from "./types.js";
/**
 * Create a UCAN, User Controlled Authorization Networks, JWT.
 * This JWT can be used for authorization.
 *
 * ### Header
 *
 * `alg`, Algorithm, the type of signature.
 * `typ`, Type, the type of this data structure, JWT.
 * `uav`, UCAN version.
 *
 * ### Payload
 *
 * `aud`, Audience, the ID of who it's intended for.
 * `exp`, Expiry, unix timestamp of when the jwt is no longer valid.
 * `iss`, Issuer, the ID of who sent this.
 * `nbf`, Not Before, unix timestamp of when the jwt becomes valid.
 * `prf`, Proof, an optional nested token with equal or greater privileges.
 * `ptc`, Potency, which rights come with the token.
 * `rsc`, Resource, the involved resource.
 *
 */
export declare function build({ addSignature, audience, dependencies, facts, issuer, lifetimeInSeconds, expiration, potency, proof, resource }: {
    addSignature?: boolean;
    audience: string;
    dependencies: {
        crypto: Crypto.Implementation;
    };
    facts?: Array<Fact>;
    issuer: string;
    lifetimeInSeconds?: number;
    expiration?: number;
    potency?: Potency;
    proof?: string | Ucan;
    resource?: Resource;
}): Promise<Ucan>;
/**
 * Try to decode a UCAN.
 * Will throw if it fails.
 *
 * @param ucan The encoded UCAN to decode
 */
export declare function decode(ucan: string): Ucan;
/**
 * Encode a UCAN.
 *
 * @param ucan The UCAN to encode
 */
export declare function encode(ucan: Ucan): string;
/**
 * Encode the header of a UCAN.
 *
 * @param header The UcanHeader to encode
 */
export declare function encodeHeader(header: UcanHeader): string;
/**
 * Encode the payload of a UCAN.
 *
 * @param payload The UcanPayload to encode
 */
export declare function encodePayload(payload: UcanPayload): string;
/**
 * Check if a UCAN is expired.
 *
 * @param ucan The UCAN to validate
 */
export declare function isExpired(ucan: Ucan): boolean;
/**
 * Check if a UCAN is self-signed.
 */
export declare function isSelfSigned(ucan: Ucan): boolean;
/**
 * Check if a UCAN is valid.
 *
 * @param ucan The decoded UCAN
 * @param did The DID associated with the signature of the UCAN
 */
export declare function isValid(crypto: Crypto.Implementation, ucan: Ucan): Promise<boolean>;
/**
 * Given a UCAN, lookup the root issuer.
 *
 * Throws when given an improperly formatted UCAN.
 * This could be a nested UCAN (ie. proof).
 *
 * @param ucan A UCAN.
 * @returns The root issuer.
 */
export declare function rootIssuer(ucan: string | Ucan, level?: number): string;
/**
 * Generate UCAN signature.
 */
export declare function sign(crypto: Crypto.Implementation, header: UcanHeader, payload: UcanPayload): Promise<string>;
