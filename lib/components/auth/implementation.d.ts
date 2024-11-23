import type { Channel, ChannelOptions } from "./channel.js";
import * as Events from "../../events.js";
import { Configuration } from "../../configuration.js";
import { Maybe } from "../../common/types.js";
import { Session } from "../../session.js";
export declare type Implementation<C> = {
    type: string;
    session: (components: C, authenticatedUsername: Maybe<string>, config: Configuration, eventEmitters: {
        fileSystem: Events.Emitter<Events.FileSystem>;
        session: Events.Emitter<Events.Session<Session>>;
    }) => Promise<Maybe<Session>>;
    isUsernameAvailable: (username: string) => Promise<boolean>;
    isUsernameValid: (username: string) => Promise<boolean>;
    register: (options: {
        username: string;
        email: string;
        code: string;
        hashedUsername: string;
    }) => Promise<{
        success: boolean;
    }>;
    emailVerify: (options: {
        email: string;
    }) => Promise<{
        success: boolean;
    }>;
    canDelegateAccount: (username: string) => Promise<boolean>;
    delegateAccount: (username: string, audience: string) => Promise<Record<string, unknown>>;
    linkDevice: (username: string, data: Record<string, unknown>) => Promise<void>;
    createChannel: (options: ChannelOptions) => Promise<Channel>;
};
