import * as DID from "../did/index.js";
import { VERSION } from "../index.js";
export async function create(config) {
    let connection = { extensionId: null, connected: false };
    let listeners;
    return {
        connect: async (extensionId) => {
            connection = await connect(extensionId, config);
            // The extension may call connect more than once, but
            // listeners should only be added once
            if (!listeners)
                listeners = listen(connection, config);
        },
        disconnect: async (extensionId) => {
            connection = await disconnect(extensionId, config);
            stopListening(config, listeners);
        }
    };
}
async function connect(extensionId, config) {
    const state = await getState(config);
    globalThis.postMessage({
        id: extensionId,
        type: "connect",
        timestamp: Date.now(),
        state
    });
    return { extensionId, connected: true };
}
async function disconnect(extensionId, config) {
    const state = await getState(config);
    globalThis.postMessage({
        id: extensionId,
        type: "disconnect",
        timestamp: Date.now(),
        state
    });
    return { extensionId, connected: false };
}
function listen(connection, config) {
    async function handleLocalChange(params) {
        const { root, path } = params;
        const state = await getState(config);
        globalThis.postMessage({
            id: connection.extensionId,
            type: "fileSystem",
            timestamp: Date.now(),
            state,
            detail: {
                type: "local-change",
                root: root.toString(),
                path
            }
        });
    }
    async function handlePublish(params) {
        const { root } = params;
        const state = await getState(config);
        globalThis.postMessage({
            id: connection.extensionId,
            type: "fileSystem",
            timestamp: Date.now(),
            state,
            detail: {
                type: "publish",
                root: root.toString()
            }
        });
    }
    async function handleSessionCreate(params) {
        const { session } = params;
        config = { ...config, session };
        const state = await getState(config);
        globalThis.postMessage({
            id: connection.extensionId,
            type: "session",
            timestamp: Date.now(),
            state,
            detail: {
                type: "create",
                username: session.username
            }
        });
    }
    async function handleSessionDestroy(params) {
        const { username } = params;
        config = { ...config, session: null };
        const state = await getState(config);
        globalThis.postMessage({
            id: connection.extensionId,
            type: "session",
            timestamp: Date.now(),
            state,
            detail: {
                type: "destroy",
                username
            }
        });
    }
    config.eventEmitters.fileSystem.on("fileSystem:local-change", handleLocalChange);
    config.eventEmitters.fileSystem.on("fileSystem:publish", handlePublish);
    config.eventEmitters.session.on("session:create", handleSessionCreate);
    config.eventEmitters.session.on("session:destroy", handleSessionDestroy);
    return { handleLocalChange, handlePublish, handleSessionCreate, handleSessionDestroy };
}
function stopListening(config, listeners) {
    if (listeners) {
        config.eventEmitters.fileSystem.removeListener("fileSystem:local-change", listeners.handleLocalChange);
        config.eventEmitters.fileSystem.removeListener("fileSystem:publish", listeners.handlePublish);
        config.eventEmitters.session.removeListener("session:create", listeners.handleSessionCreate);
        config.eventEmitters.session.removeListener("session:destroy", listeners.handleSessionDestroy);
    }
}
async function getState(config) {
    const { capabilities, dependencies, namespace, session } = config;
    const agentDID = await DID.agent(dependencies.crypto);
    let accountDID = null;
    let username = null;
    let dataRootCID = null;
    if (session && session.username) {
        username = session.username;
        accountDID = await dependencies.reference.didRoot.lookup(username);
        dataRootCID = await dependencies.reference.dataRoot.lookup(username);
    }
    return {
        app: {
            namespace,
            ...(capabilities ? { capabilities } : {})
        },
        fileSystem: {
            dataRootCID: dataRootCID?.toString() ?? null
        },
        user: {
            username,
            accountDID,
            agentDID
        },
        odd: {
            version: VERSION
        }
    };
}
//# sourceMappingURL=index.js.map