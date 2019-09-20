import { touch } from '../Utils/common'
import * as LoginService from '../Service/user'
import axios from 'axios'
import { CreateToken } from '../auth'
import { ControllerBase, Controller, Get, Authorize } from '../Utils/Decorators/RouterDecorator';
import { Middleware,ParameterizedContext } from 'koa';
const AppConfig = require('../../app.json')


const Code2SessionUrl = (AppID: string, AppSecret: string, code: string | any): string => `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`

// const WechatAccountLogin = Controller('login', 'get', async ctx => {
//   await touch<string>(ctx.query.code)
//     .then(async code => {
//       const { Wechat: { AppID, AppSecret } } = AppConfig
//       try {
//         const { data, status } = await axios.get(Code2SessionUrl(AppID, AppSecret, code))
//         if (status === 200) {
//           // request successful. begin reading user info.
//           const { openid, session_key, errcode } = data
//           // handle errcode sent by wechat server. more detailed see wechat miniprogram documents.
//           switch (errcode) {
//             case -1:
//               ctx.body = {
//                 ErrCode: errcode,
//                 Reason: "Wechat server is busy. Please try again."
//               }
//               break;
//             case 0:

//               break;
//             case 40029:
//               ctx.body = {
//                 ErrCode: errcode,
//                 Reason: "Login code is invalid."
//               }
//               break;
//             case 45011:
//               ctx.body = {
//                 ErrCode: errcode,
//                 Reason: "Frequency limited. Each user should only call for login less than 100 times one minus."
//               }
//               break;
//           }
//         }
//       }
//       catch (error) {
//         ctx.status = 400
//         ctx.body = error
//       }
//     }, _ => {
//       ctx.body = {
//         Reason: "Login code is invalid. Should not be empty."
//       }
//     })
// })

// const SimpleLogin = Controller('simple', 'post', async ctx => {
//   const { username, passwd } = ctx.request.body
//   if (username === "TestUser" && passwd === "123") {
//     LoginService.Login(username,passwd)
//     ctx.body = {
//       token: CreateToken({user : username})
//     }
//   }
//   else ctx.body = "Invalid username or password."
// })

@Controller("user")
class SimpleController extends ControllerBase {

  @Get('hello')
  async SayHello(ctx: ParameterizedContext<any, {}>) {
    ctx.body = "Hello! I am a controller with decorator injected to koa-router."
  }

  @Get("secret")
  @Authorize
  async OneSecretArea(ctx: ParameterizedContext<any,{}>) {
    ctx.body = "You are entered into secret area."
  }
}

export default SimpleController