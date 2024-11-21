import { SymmAlg } from "keystore-idb/types.js";
import { RSAKeyStore } from "keystore-idb/rsa/index.js";
import { Implementation, ImplementationOptions, VerifyArgs } from "../implementation.js";
export declare const aes: {
    decrypt: typeof aesDecrypt;
    encrypt: typeof aesEncrypt;
    exportKey: typeof aesExportKey;
    genKey: typeof aesGenKey;
};
export declare function importAesKey(key: Uint8Array, alg: SymmAlg): Promise<CryptoKey>;
export declare function aesDecrypt(encrypted: Uint8Array, key: CryptoKey | Uint8Array, alg: SymmAlg, iv?: Uint8Array): Promise<Uint8Array>;
export declare function aesEncrypt(data: Uint8Array, key: CryptoKey | Uint8Array, alg: SymmAlg, iv?: Uint8Array): Promise<Uint8Array>;
export declare function aesExportKey(key: CryptoKey): Promise<Uint8Array>;
export declare function aesGenKey(alg: SymmAlg): Promise<CryptoKey>;
export declare const did: Implementation["did"];
export declare function ed25519Verify({ message, publicKey, signature }: VerifyArgs): Promise<boolean>;
export declare function rsaVerify({ message, publicKey, signature }: VerifyArgs): Promise<boolean>;
export declare const hash: {
    sha256: typeof sha256;
};
export declare function sha256(bytes: Uint8Array): Promise<Uint8Array>;
export declare function ksClearStore(ks: RSAKeyStore): Promise<void>;
export declare function ksDecrypt(ks: RSAKeyStore, cipherText: Uint8Array): Promise<Uint8Array>;
export declare function ksExportSymmKey(ks: RSAKeyStore, keyName: string): Promise<Uint8Array>;
export declare function ksGetAlgorithm(ks: RSAKeyStore): Promise<string>;
export declare function ksGetUcanAlgorithm(ks: RSAKeyStore): Promise<string>;
export declare function ksImportSymmKey(ks: RSAKeyStore, key: Uint8Array, name: string): Promise<void>;
export declare function ksKeyExists(ks: RSAKeyStore, keyName: string): Promise<boolean>;
export declare function ksPublicExchangeKey(ks: RSAKeyStore): Promise<Uint8Array>;
export declare function ksPublicWriteKey(ks: RSAKeyStore): Promise<Uint8Array>;
export declare function ksSign(ks: RSAKeyStore, message: Uint8Array): Promise<Uint8Array>;
export declare const misc: {
    randomNumbers: typeof randomNumbers;
};
export declare function randomNumbers(options: {
    amount: number;
}): Uint8Array;
export declare const rsa: {
    decrypt: typeof rsaDecrypt;
    encrypt: typeof rsaEncrypt;
    exportPublicKey: typeof rsaExportPublicKey;
    genKey: typeof rsaGenKey;
};
export declare const RSA_ALGORITHM = "RSA-OAEP";
export declare const RSA_HASHING_ALGORITHM = "SHA-256";
export declare function importRsaKey(key: Uint8Array, keyUsages: KeyUsage[]): Promise<CryptoKey>;
export declare function rsaDecrypt(data: Uint8Array, privateKey: CryptoKey | Uint8Array): Promise<Uint8Array>;
export declare function rsaEncrypt(message: Uint8Array, publicKey: CryptoKey | Uint8Array): Promise<Uint8Array>;
export declare function rsaExportPublicKey(key: CryptoKey): Promise<Uint8Array>;
export declare function rsaGenKey(): Promise<CryptoKeyPair>;
export declare function implementation({ storeName, exchangeKeyName, writeKeyName }: ImplementationOptions): Promise<Implementation>;
