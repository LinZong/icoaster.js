"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_loader_1 = require("../router-loader");
const common_1 = require("../Utils/common");
const LoginService = require("../Service/user");
const axios_1 = require("axios");
const auth_1 = require("../auth");
const AppConfig = require('../../app.json');
const Code2SessionUrl = (AppID, AppSecret, code) => `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`;
const WechatAccountLogin = router_loader_1.Controller('login', 'get', async (ctx) => {
    await common_1.touch(ctx.query.code)
        .then(async (code) => {
        const { Wechat: { AppID, AppSecret } } = AppConfig;
        try {
            const { data, status } = await axios_1.default.get(Code2SessionUrl(AppID, AppSecret, code));
            if (status === 200) {
                // request successful. begin reading user info.
                const { openid, session_key, errcode } = data;
                // handle errcode sent by wechat server. more detailed see wechat miniprogram documents.
                switch (errcode) {
                    case -1:
                        ctx.body = {
                            ErrCode: errcode,
                            Reason: "Wechat server is busy. Please try again."
                        };
                        break;
                    case 0:
                        break;
                    case 40029:
                        ctx.body = {
                            ErrCode: errcode,
                            Reason: "Login code is invalid."
                        };
                        break;
                    case 45011:
                        ctx.body = {
                            ErrCode: errcode,
                            Reason: "Frequency limited. Each user should only call for login less than 100 times one minus."
                        };
                        break;
                }
            }
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = error;
        }
    }, _ => {
        ctx.body = {
            Reason: "Login code is invalid. Should not be empty."
        };
    });
});
const SimpleLogin = router_loader_1.Controller('simple', 'post', async (ctx) => {
    const { username, passwd } = ctx.request.body;
    if (username === "TestUser" && passwd === "123") {
        LoginService.Login(username, passwd);
        ctx.body = {
            token: auth_1.CreateToken({ user: username })
        };
    }
    else
        ctx.body = "Invalid username or password";
});
exports.default = [WechatAccountLogin, SimpleLogin];
//# sourceMappingURL=user.js.map