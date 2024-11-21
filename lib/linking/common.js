export var LinkingStep;
(function (LinkingStep) {
    LinkingStep["Broadcast"] = "BROADCAST";
    LinkingStep["Negotiation"] = "NEGOTIATION";
    LinkingStep["Delegation"] = "DELEGATION";
})(LinkingStep || (LinkingStep = {}));
export class LinkingError extends Error {
    constructor(message) {
        super(message);
        this.name = "LinkingError";
    }
}
export class LinkingWarning extends Error {
    constructor(message) {
        super(message);
        this.name = "LinkingWarning";
    }
}
export const handleLinkingError = (manners, error) => {
    switch (error.name) {
        case "LinkingWarning":
            manners.warn(error.message);
            break;
        case "LinkingError":
            throw error;
        default:
            throw error;
    }
};
export const tryParseMessage = (data, typeGuard, context) => {
    try {
        const message = JSON.parse(data);
        if (typeGuard(message)) {
            return {
                ok: true,
                value: message
            };
        }
        else {
            return {
                ok: false,
                error: new LinkingWarning(`${context.participant} received an unexpected message in ${context.callSite}: ${data}. Ignoring message.`)
            };
        }
    }
    catch {
        return {
            ok: false,
            error: new LinkingWarning(`${context.participant} received a message in ${context.callSite} that it could not parse: ${data}. Ignoring message.`)
        };
    }
};
//# sourceMappingURL=common.js.map