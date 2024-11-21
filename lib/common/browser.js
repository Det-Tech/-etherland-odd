export const isBrowser = typeof self !== "undefined" && typeof self.location === "object";
export const assertBrowser = (method) => {
    if (!isBrowser) {
        throw new Error(`Must be in browser to use method. Provide a node-compatible implementation for ${method}`);
    }
};
//# sourceMappingURL=browser.js.map