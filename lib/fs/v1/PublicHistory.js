import { decodeCID } from "../../common/index.js";
export default class PublicHistory {
    constructor(node) {
        this.node = node;
    }
    /**
     * Go back one or more versions.
     *
     * @param delta Optional negative number to specify how far to go back
     */
    back(delta = -1) {
        const length = Math.abs(Math.min(delta, -1));
        return Array.from({ length }, (_, i) => i).reduce((promise) => promise.then((n) => n ? PublicHistory._getPreviousVersion(n) : null), Promise.resolve(this.node));
    }
    // async forward(delta: number = 1): Promise<Maybe<Node>> {}
    /**
     * Get a version before a given timestamp.
     *
     * @param timestamp Unix timestamp in seconds
     */
    async prior(timestamp) {
        return PublicHistory._prior(this.node, timestamp);
    }
    /**
     * List earlier versions along with the timestamp they were created.
     */
    async list(amount = 5) {
        const { acc } = await Array.from({ length: amount }, (_, i) => i).reduce((promise, i) => promise.then(({ node, acc }) => {
            if (!node)
                return Promise.resolve({ node: null, acc });
            return PublicHistory
                ._getPreviousVersion(node)
                .then(n => ({
                node: n,
                acc: [
                    ...acc,
                    { delta: -(i + 1), timestamp: node.header.metadata.unixMeta.mtime }
                ]
            }));
        }), PublicHistory
            ._getPreviousVersion(this.node)
            .then(n => ({ node: n, acc: [] })));
        return acc;
    }
    /**
     * @internal
     */
    static async _getPreviousVersion(node) {
        if (!node.header.previous)
            return Promise.resolve(null);
        return node.fromCID(decodeCID(node.header.previous));
    }
    /**
     * @internal
     */
    static async _prior(node, timestamp) {
        if (node.header.metadata.unixMeta.mtime < timestamp)
            return node;
        const previous = await PublicHistory._getPreviousVersion(node);
        return previous ? PublicHistory._prior(previous, timestamp) : null;
    }
}
//# sourceMappingURL=PublicHistory.js.map