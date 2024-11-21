import { KEYS } from "./keys/default.js";
export async function getItem(mem, key) {
    return mem[key];
}
export async function setItem(mem, key, val) {
    mem[key] = val;
    return val;
}
export async function removeItem(mem, key) {
    delete mem[key];
}
export async function clear(mem) {
    for (const k in mem)
        delete mem[k];
}
// 🛳
export function implementation() {
    const mem = {};
    return {
        KEYS,
        getItem: (...args) => getItem(mem, ...args),
        setItem: (...args) => setItem(mem, ...args),
        removeItem: (...args) => removeItem(mem, ...args),
        clear: (...args) => clear(mem, ...args),
    };
}
//# sourceMappingURL=memory.js.map