import localforage from "localforage";
import { KEYS } from "./keys/default.js";
import { assertBrowser } from "../../../common/browser.js";
export function getItem(db, key) {
    assertBrowser("storage.getItem");
    return db.getItem(key);
}
export function setItem(db, key, val) {
    assertBrowser("storage.setItem");
    return db.setItem(key, val);
}
export function removeItem(db, key) {
    assertBrowser("storage.removeItem");
    return db.removeItem(key);
}
export async function clear(db) {
    assertBrowser("storage.clear");
    return db.clear();
}
// 🛳
export function implementation({ name }) {
    const db = localforage.createInstance({ name });
    return {
        KEYS,
        getItem: (...args) => getItem(db, ...args),
        setItem: (...args) => setItem(db, ...args),
        removeItem: (...args) => removeItem(db, ...args),
        clear: (...args) => clear(db, ...args),
    };
}
//# sourceMappingURL=browser.js.map