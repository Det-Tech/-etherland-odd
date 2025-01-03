import * as Base from "./base.js";
import * as ChannelFission from "./fission/channel.js";
import * as ChannelMod from "../channel.js";
import * as Fission from "./fission/index.js";
// @ts-ignore
import { Client } from '../../../sdk/index';
import { Agent } from '@fission-codes/ucan/agent';
import { EdDSASigner } from 'iso-signatures/signers/eddsa.js';
const SERVER_URL = process.env.SERVER_URL || 'https://auth.etherland.world';
export function createChannel(endpoints, dependencies, options) {
    return ChannelMod.createWssChannel(dependencies.reference, ChannelFission.endpoint(`${endpoints.server}${endpoints.apiPath}`.replace(/^https?:\/\//, "wss://")), options);
}
export const isUsernameAvailable = async (endpoints, username) => {
    return Fission.isUsernameAvailable(endpoints, username);
};
export const isUsernameValid = async (username) => {
    return Fission.isUsernameValid(username);
};
export const emailVerify = async (endpoints, dependencies, options) => {
    const { success } = await Fission.emailVerify(endpoints, options);
    return { success: success };
};
const resolveSigner = (exported) => {
    if (typeof exported === 'string') {
        return EdDSASigner.import(exported);
    }
    return EdDSASigner.generate();
};
let client;
export const register = async (endpoints, dependencies, options) => {
    // const { success } = await Fission.createAccount(endpoints, dependencies, options)
    console.log("endpoints ", endpoints);
    const agent = await Agent.create({
        resolveSigner,
    });
    console.log("agent ", agent);
    client = await Client.create({
        url: SERVER_URL,
        agent,
    });
    console.log("client ", client);
    // const out = await client.verifyEmail(email)
    const createAccount = await client.accountCreate({
        code: options.code,
        email: options.email,
        username: options.username,
    });
    localStorage.setItem("user", JSON.stringify(createAccount.result));
    localStorage.setItem("ucans", JSON.stringify(client?.session?.ucans));
    console.log("createAccount.........", createAccount);
    console.log("client&&& ", client);
    return Base.register(dependencies, { ...options, type: Base.TYPE });
    return { success: false };
};
export const getAccountInfo = async () => {
    try {
        // const { success } = await Fission.createAccount(endpoints, dependencies, options)
        console.log("endpoints ", "endpoints");
        if (!client) {
            console.log("creating client again ");
            const agent = await Agent.create({
                resolveSigner,
            });
            console.log("agent ", agent);
            client = await Client.create({
                url: SERVER_URL,
                agent,
            });
        }
        console.log("getAccountInfo123123 client ", client);
        // const out = await client.verifyEmail(email)
        const user = localStorage.getItem("user");
        const ucans = localStorage.getItem("ucans");
        console.log("user did.........", user, JSON.parse(user)?.did);
        console.log("user ucans.........", user, JSON.parse(ucans));
        const accountInfo = await client.accountInfo(JSON.parse(user)?.did);
        console.log("accountInfo.........", accountInfo);
        return { data: accountInfo?.result };
    }
    catch (err) {
        return { data: null };
    }
};
// 🛳
export function implementation(endpoints, dependencies) {
    const base = Base.implementation(dependencies);
    return {
        type: base.type,
        canDelegateAccount: base.canDelegateAccount,
        delegateAccount: base.delegateAccount,
        linkDevice: base.linkDevice,
        session: base.session,
        isUsernameValid,
        createChannel: (...args) => createChannel(endpoints, dependencies, ...args),
        isUsernameAvailable: (...args) => isUsernameAvailable(endpoints, ...args),
        register: (...args) => register(endpoints, dependencies, ...args),
        emailVerify: (...args) => emailVerify(endpoints, dependencies, ...args)
    };
}
//# sourceMappingURL=fission-base.js.map