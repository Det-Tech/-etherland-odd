import * as FissionBase from "./fission-base.js";
import * as Wnfs from "./wnfs.js";
// 🛳
export function implementation(endpoints, dependencies) {
    const fissionBase = FissionBase.implementation(endpoints, dependencies);
    const wnfs = Wnfs.implementation(dependencies);
    return {
        type: wnfs.type,
        canDelegateAccount: wnfs.canDelegateAccount,
        delegateAccount: wnfs.delegateAccount,
        linkDevice: wnfs.linkDevice,
        session: wnfs.session,
        createChannel: fissionBase.createChannel,
        isUsernameValid: fissionBase.isUsernameValid,
        isUsernameAvailable: fissionBase.isUsernameAvailable,
        register: fissionBase.register,
        emailVerify: fissionBase.emailVerify,
    };
}
//# sourceMappingURL=fission-wnfs.js.map