"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const safe_touch_1 = require("safe-touch");
function touch(param) {
    return new Promise((resolve, reject) => {
        const touched = safe_touch_1.safeTouch(param);
        if (touched)
            resolve(touched);
        else
            reject();
    });
}
exports.touch = touch;
//# sourceMappingURL=common.js.map