import * as Base from "./base.js";
import * as ChannelFission from "./fission/channel.js";
import * as ChannelMod from "../channel.js";
import * as Fission from "./fission/index.js";
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
export const register = async (endpoints, dependencies, options) => {
    // const { success } = await Fission.createAccount(endpoints, dependencies, options)
    return Base.register(dependencies, { ...options, type: Base.TYPE });
    return { success: false };
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
        register: (...args) => register(endpoints, dependencies, ...args)
    };
}
//# sourceMappingURL=fission-base.js.map