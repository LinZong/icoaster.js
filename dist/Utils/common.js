"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function touch(param) {
    return new Promise((resolve, reject) => {
        if (param)
            resolve(param);
        else
            reject();
    });
}
exports.touch = touch;
//# sourceMappingURL=common.js.map