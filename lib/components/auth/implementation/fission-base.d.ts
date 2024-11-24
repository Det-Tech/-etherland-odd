import type { Components } from "../../../components.js";
import type { Dependencies } from "./base.js";
import type { Channel, ChannelOptions } from "../channel.js";
import type { Implementation } from "../implementation.js";
import * as Fission from "./fission/index.js";
export declare function createChannel(endpoints: Fission.Endpoints, dependencies: Dependencies, options: ChannelOptions): Promise<Channel>;
export declare const isUsernameAvailable: (endpoints: Fission.Endpoints, username: string) => Promise<boolean>;
export declare const isUsernameValid: (username: string) => Promise<boolean>;
export declare const emailVerify: (endpoints: Fission.Endpoints, dependencies: Dependencies, options: {
    email?: string;
}) => Promise<{
    success: boolean;
}>;
export declare const register: (endpoints: Fission.Endpoints, dependencies: Dependencies, options: {
    username: string;
    email: string;
    code: string;
    hashedUsername: string;
}) => Promise<{
    success: boolean;
}>;
export declare const getAccountInfo: () => Promise<{
    data: any;
}>;
export declare function implementation(endpoints: Fission.Endpoints, dependencies: Dependencies): Implementation<Components>;
