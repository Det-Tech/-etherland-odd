import * as uint8arrays from "uint8arrays";
import { webcrypto } from "one-webcrypto";
import tweetnacl from "tweetnacl";
import * as keystoreAES from "keystore-idb/aes/index.js";
import * as keystoreIDB from "keystore-idb/constants.js";
import { HashAlg, SymmKeyLength } from "keystore-idb/types.js";
import { RSAKeyStore } from "keystore-idb/rsa/index.js";
import rsaOperations from "keystore-idb/rsa/index.js";
import * as typeChecks from "../../../common/type-checks.js";
// AES
export const aes = {
    decrypt: aesDecrypt,
    encrypt: aesEncrypt,
    exportKey: aesExportKey,
    genKey: aesGenKey,
};
export function importAesKey(key, alg) {
    return webcrypto.subtle.importKey("raw", key, {
        name: alg,
        length: SymmKeyLength.B256,
    }, true, ["encrypt", "decrypt"]);
}
export async function aesDecrypt(encrypted, key, alg, iv) {
    const cryptoKey = typeChecks.isCryptoKey(key) ? key : await importAesKey(key, alg);
    const decrypted = iv
        ? await webcrypto.subtle.decrypt({ name: alg, iv }, cryptoKey, encrypted)
        // the keystore version prefixes the `iv` into the cipher text
        : await keystoreAES.decryptBytes(encrypted, cryptoKey, { alg });
    return new Uint8Array(decrypted);
}
export async function aesEncrypt(data, key, alg, iv) {
    const cryptoKey = typeChecks.isCryptoKey(key) ? key : await importAesKey(key, alg);
    // the keystore version prefixes the `iv` into the cipher text
    const encrypted = iv
        ? await webcrypto.subtle.encrypt({ name: alg, iv }, cryptoKey, data)
        : await keystoreAES.encryptBytes(data, cryptoKey, { alg });
    return new Uint8Array(encrypted);
}
export async function aesExportKey(key) {
    const buffer = await webcrypto.subtle.exportKey("raw", key);
    return new Uint8Array(buffer);
}
export function aesGenKey(alg) {
    return keystoreAES.makeKey({ length: SymmKeyLength.B256, alg });
}
// DID
export const did = {
    keyTypes: {
        "bls12-381": {
            magicBytes: new Uint8Array([0xea, 0x01]),
            verify: () => { throw new Error("Not implemented"); },
        },
        "ed25519": {
            magicBytes: new Uint8Array([0xed, 0x01]),
            verify: ed25519Verify,
        },
        "rsa": {
            magicBytes: new Uint8Array([0x00, 0xf5, 0x02]),
            verify: rsaVerify,
        },
    }
};
export async function ed25519Verify({ message, publicKey, signature }) {
    return tweetnacl.sign.detached.verify(message, signature, publicKey);
}
export async function rsaVerify({ message, publicKey, signature }) {
    return rsaOperations.verify(message, signature, await webcrypto.subtle.importKey("spki", publicKey, { name: keystoreIDB.RSA_WRITE_ALG, hash: RSA_HASHING_ALGORITHM }, false, ["verify"]), 8);
}
// HASH
export const hash = {
    sha256
};
export async function sha256(bytes) {
    return new Uint8Array(await webcrypto.subtle.digest("sha-256", bytes));
}
// KEYSTORE
export function ksClearStore(ks) {
    return ks.destroy();
}
export async function ksDecrypt(ks, cipherText) {
    const exchangeKey = await ks.exchangeKey();
    return rsaDecrypt(cipherText, exchangeKey.privateKey);
}
export async function ksExportSymmKey(ks, keyName) {
    if (await ks.keyExists(keyName) === false) {
        throw new Error(`Expected a key under the name '${keyName}', but couldn't find anything`);
        // We're throwing an error here so that the function `getSymmKey` below doesn't create a key.
    }
    const key = await ks.getSymmKey(keyName);
    const raw = await webcrypto.subtle.exportKey("raw", key);
    return new Uint8Array(raw);
}
export function ksGetAlgorithm(ks) {
    return Promise.resolve("rsa");
}
export function ksGetUcanAlgorithm(ks) {
    return Promise.resolve("RS256");
}
export function ksImportSymmKey(ks, key, name) {
    return ks.importSymmKey(uint8arrays.toString(key, "base64pad"), name);
}
export function ksKeyExists(ks, keyName) {
    return ks.keyExists(keyName);
}
export async function ksPublicExchangeKey(ks) {
    const keypair = await ks.exchangeKey();
    const spki = await webcrypto.subtle.exportKey("spki", keypair.publicKey);
    return new Uint8Array(spki);
}
export async function ksPublicWriteKey(ks) {
    const keypair = await ks.writeKey();
    const spki = await webcrypto.subtle.exportKey("spki", keypair.publicKey);
    return new Uint8Array(spki);
}
export async function ksSign(ks, message) {
    const writeKey = await ks.writeKey();
    const arrayBuffer = await rsaOperations.sign(message, writeKey.privateKey, ks.cfg.charSize);
    return new Uint8Array(arrayBuffer);
}
// MISC
export const misc = {
    randomNumbers,
};
export function randomNumbers(options) {
    return webcrypto.getRandomValues(new Uint8Array(options.amount));
}
// RSA
export const rsa = {
    decrypt: rsaDecrypt,
    encrypt: rsaEncrypt,
    exportPublicKey: rsaExportPublicKey,
    genKey: rsaGenKey,
};
// RSA
// ---
// Exchange keys:
export const RSA_ALGORITHM = "RSA-OAEP";
export const RSA_HASHING_ALGORITHM = "SHA-256";
export function importRsaKey(key, keyUsages) {
    return webcrypto.subtle.importKey("spki", key, { name: RSA_ALGORITHM, hash: RSA_HASHING_ALGORITHM }, false, keyUsages);
}
export async function rsaDecrypt(data, privateKey) {
    const arrayBuffer = await webcrypto.subtle.decrypt({
        name: RSA_ALGORITHM
    }, typeChecks.isCryptoKey(privateKey)
        ? privateKey
        : await importRsaKey(privateKey, ["decrypt"]), data);
    return new Uint8Array(arrayBuffer);
}
export async function rsaEncrypt(message, publicKey) {
    const key = typeChecks.isCryptoKey(publicKey)
        ? publicKey
        : await importRsaKey(publicKey, ["encrypt"]);
    const arrayBuffer = await webcrypto.subtle.encrypt({
        name: RSA_ALGORITHM
    }, key, message);
    return new Uint8Array(arrayBuffer);
}
export async function rsaExportPublicKey(key) {
    const buffer = await webcrypto.subtle.exportKey("spki", key);
    return new Uint8Array(buffer);
}
export function rsaGenKey() {
    return webcrypto.subtle.generateKey({
        name: RSA_ALGORITHM,
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: RSA_HASHING_ALGORITHM }
    }, true, ["encrypt", "decrypt"]);
}
// 🛳
export async function implementation({ storeName, exchangeKeyName, writeKeyName }) {
    const ks = await RSAKeyStore.init({
        charSize: 8,
        hashAlg: HashAlg.SHA_256,
        storeName,
        exchangeKeyName,
        writeKeyName,
    });
    return {
        aes,
        did,
        hash,
        misc,
        rsa,
        keystore: {
            clearStore: (...args) => ksClearStore(ks, ...args),
            decrypt: (...args) => ksDecrypt(ks, ...args),
            exportSymmKey: (...args) => ksExportSymmKey(ks, ...args),
            getAlgorithm: (...args) => ksGetAlgorithm(ks, ...args),
            getUcanAlgorithm: (...args) => ksGetUcanAlgorithm(ks, ...args),
            importSymmKey: (...args) => ksImportSymmKey(ks, ...args),
            keyExists: (...args) => ksKeyExists(ks, ...args),
            publicExchangeKey: (...args) => ksPublicExchangeKey(ks, ...args),
            publicWriteKey: (...args) => ksPublicWriteKey(ks, ...args),
            sign: (...args) => ksSign(ks, ...args),
        },
    };
}
//# sourceMappingURL=browser.js.map