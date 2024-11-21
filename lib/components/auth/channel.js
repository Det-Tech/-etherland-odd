// FUNCTIONS
export const createWssChannel = async (reference, socketEndpoint, options) => {
    const { username, handleMessage } = options;
    const rootDID = await waitForRootDid(reference, username);
    if (!rootDID) {
        throw new Error(`Failed to lookup DID for ${username}`);
    }
    const topic = `deviceLink#${rootDID}`;
    console.log("Opening channel", topic);
    const socket = new WebSocket(socketEndpoint({ rootDID }));
    await waitForOpenConnection(socket);
    socket.onmessage = handleMessage;
    const send = publishOnWssChannel(socket);
    const close = closeWssChannel(socket);
    return {
        send,
        close
    };
};
const waitForRootDid = async (reference, username) => {
    let rootDid = await reference.didRoot.lookup(username).catch(() => {
        console.warn("Could not fetch root DID. Retrying.");
        return null;
    });
    if (rootDid) {
        return rootDid;
    }
    return new Promise((resolve, reject) => {
        const maxRetries = 10;
        let tries = 0;
        const rootDidInterval = setInterval(async () => {
            rootDid = await reference.didRoot.lookup(username).catch(() => {
                console.warn("Could not fetch root DID. Retrying.");
                return null;
            });
            if (!rootDid && tries < maxRetries) {
                tries++;
                return;
            }
            else if (!rootDid && tries === maxRetries) {
                reject("Failed to fetch root DID.");
            }
            clearInterval(rootDidInterval);
            resolve(rootDid);
        }, 1000);
    });
};
const waitForOpenConnection = async (socket) => {
    return new Promise((resolve, reject) => {
        socket.onopen = () => resolve();
        socket.onerror = () => reject("Websocket channel could not be opened");
    });
};
export const closeWssChannel = (socket) => {
    return function () {
        if (socket)
            socket.close(1000);
    };
};
export const publishOnWssChannel = (socket) => {
    return function (data) {
        const binary = typeof data === "string"
            ? new TextEncoder().encode(data).buffer
            : data;
        socket?.send(binary);
    };
};
//# sourceMappingURL=channel.js.map