import * as Reference from "../reference/implementation.js";
import type { Maybe } from "../../common/types.js";
export declare type Channel = {
    close: () => void;
    send: (data: ChannelData) => void;
};
export declare type ChannelOptions = {
    handleMessage: (event: MessageEvent) => void;
    username: string;
};
export declare type ChannelData = string | ArrayBufferLike | Blob | ArrayBufferView;
export declare const createWssChannel: (reference: Reference.Implementation, socketEndpoint: ({ rootDID }: {
    rootDID: string;
}) => string, options: ChannelOptions) => Promise<Channel>;
export declare const closeWssChannel: (socket: Maybe<WebSocket>) => () => void;
export declare const publishOnWssChannel: (socket: WebSocket) => (data: ChannelData) => void;
