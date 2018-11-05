const int64 = require('int64');
const siphash = require("siphash");
const siphash_key = [0x0, 0x0, 0x1, 0x0];

export class LyticsUtils {
    static generateSipHash(value: string): Promise<Number> {
        const hash = siphash.hash(siphash_key, value);
        const hex = [hash.h.toString(16), hash.l.toString(16)].join('');
        const hashedValue = int64.hex2dec(hex);
        return Promise.resolve(hashedValue);
    }
}