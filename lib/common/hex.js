export const fromBytes = (bytes) => {
    return Array.prototype.map.call(bytes, x => ("00" + x.toString(16)).slice(-2) // '00' is for left padding
    ).join("");
};
export const toBytes = (hex) => {
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return arr;
};
//# sourceMappingURL=hex.js.map