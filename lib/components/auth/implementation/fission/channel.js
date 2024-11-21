export function endpoint(host) {
    return ({ rootDID }) => {
        return `${host}/user/link/${rootDID}`;
    };
}
//# sourceMappingURL=channel.js.map