// 🛳
export function implementation(opts) {
    return {
        log: opts.configuration.debug ? console.log : () => { },
        warn: opts.configuration.debug ? console.warn : () => { },
        // WASM
        wnfsWasmLookup: wnfsVersion => fetch(`https://unpkg.com/wnfs@${wnfsVersion}/wasm_wnfs_bg.wasm`),
        // File system
        fileSystem: {
            hooks: {
                afterLoadExisting: async () => { },
                afterLoadNew: async (fs) => { await fs.publish(); },
                beforeLoadExisting: async () => { },
                beforeLoadNew: async () => { },
            },
        },
    };
}
//# sourceMappingURL=base.js.map