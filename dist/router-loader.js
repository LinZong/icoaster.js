"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const KoaRouter = require("koa-router");
const fs = require("fs");
const path = require("path");
class KoaWithRouter extends Koa {
    LoadRouters(paths) {
        const router = new KoaRouter();
        paths.forEach(it => router.use(it.routes()));
        this.use(router.routes());
    }
}
exports.KoaWithRouter = KoaWithRouter;
function Controller(Path, Method, body) {
    Path = Path.startsWith('/') ? Path : `/${Path}`;
    return [Path, Method, body];
}
exports.Controller = Controller;
const SupportHttpMethod = ['get', 'post', 'put'];
function DiscoveryAllController() {
    function JoinPath(...args) {
        return path.join(__dirname, 'Controller', ...args);
    }
    const result = [];
    const fileExtReg = /(\.js$|\.ts$|\.tsx$)/;
    const controllers = path.join(__dirname, 'Controller');
    fs.readdirSync(controllers).forEach(fd => {
        if (!fileExtReg.test(fd))
            return;
        // 创建当前控制器的路由
        const fileWithoutExt = fd.replace(fileExtReg, '');
        const loadPath = JoinPath(fd);
        const mod = require(loadPath).default;
        if (mod instanceof Array) {
            const _router = new KoaRouter({ prefix: `/${fileWithoutExt}` });
            mod.forEach(([path, method, handler]) => {
                const _method = method.toLowerCase();
                if (SupportHttpMethod.indexOf(_method) != -1) {
                    // This is a correct controller, register it into router
                    switch (_method) {
                        case 'get':
                            _router.get(path, handler);
                            break;
                        case 'post':
                            _router.post(path, handler);
                            break;
                        case 'put':
                            _router.put(path, handler);
                            break;
                    }
                }
            });
            result.push(_router);
        }
    });
    return result;
}
exports.DiscoveryAllController = DiscoveryAllController;
//# sourceMappingURL=router-loader.js.map