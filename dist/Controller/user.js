"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_loader_1 = require("../router-loader");
const common_1 = require("../Utils/common");
const AppConfig = require('../../app.json');
const Code2SessionUrl = (AppID, AppSecret, code) => `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`;
const Login = router_loader_1.Controller('login', 'get', async (ctx) => {
    await common_1.touch(ctx.query.code)
        .then(code => {
        const { Wechat: { AppID, AppSecret } } = AppConfig;
        // const { data, status } = await axios.get()
        // ctx.status = status
        ctx.body = Code2SessionUrl(AppID, AppSecret, code);
    }, _ => {
        ctx.body = {
            Reason: "Wechat app login code is invalid."
        };
    });
});
const SayHello = router_loader_1.Controller('hello', 'get', async (ctx) => ctx.body = "Hello!");
exports.default = [Login, SayHello];
//# sourceMappingURL=user.js.map