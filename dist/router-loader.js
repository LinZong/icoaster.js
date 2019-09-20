"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const KoaRouter = require("koa-router");
const fs = require("fs");
const path = require("path");
const auth_1 = require("./auth");
class KoaWithRouter extends Koa {
    LoadRouters(paths) {
        const router = new KoaRouter();
        paths.forEach(it => router.use(it.routes()));
        this.use(router.routes());
    }
}
exports.KoaWithRouter = KoaWithRouter;
function Controller(Path, Method, body, withAuth) {
    Path = Path.startsWith('/') ? Path : `/${Path}`;
    return [Path, Method, body, withAuth];
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
        const fileWithoutExt = fd.replace(fileExtReg, '');
        const loadPath = JoinPath(fd);
        const mod = require(loadPath).default;
        if (mod instanceof Array) {
            const _router = new KoaRouter({ prefix: `/${fileWithoutExt}` });
            mod.forEach(([path, method, mw, withAuth]) => {
                const _method = method.toLowerCase();
                if (SupportHttpMethod.indexOf(_method) != -1) {
                    // This is a correct controller, register it into router
                    let middleware = [mw];
                    if (withAuth)
                        middleware.unshift(auth_1.JWTMiddleware);
                    switch (_method) {
                        case 'get':
                            _router.get(path, ...middleware);
                            break;
                        case 'post':
                            _router.post(path, ...middleware);
                            break;
                        case 'put':
                            _router.put(path, ...middleware);
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