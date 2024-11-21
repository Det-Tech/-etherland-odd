export declare type SessionKey = {
    sessionKey: string;
};
export declare type Fact = SessionKey | Record<string, string>;
export declare type Resource = "*" | Record<string, string>;
export declare type Potency = string | Record<string, unknown> | undefined | null;
export declare type UcanHeader = {
    alg: string;
    typ: string;
    uav: string;
};
export declare type UcanPayload = {
    aud: string;
    exp: number;
    fct: Array<Fact>;
    iss: string;
    nbf: number;
    prf: string | null;
    ptc: Potency;
    rsc: Resource;
};
export declare type Ucan = {
    header: UcanHeader;
    payload: UcanPayload;
    signature: string | null;
};
