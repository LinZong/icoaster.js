import { touch } from '../Utils/common'
import * as LoginService from '../Service/user'
import axios from 'axios'
import { ControllerBase, Controller, Get, Authorize, Post } from '../Utils/Decorators/RouterDecorator';
import { ParameterizedContext } from 'koa';
import { Required, ParameterType } from '../Utils/Decorators/ParameterValidatorDecorator';
const AppConfig = require('../../app.json')


const Code2SessionUrl = (AppID: string, AppSecret: string, code: string | any): string => `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`

@Controller("user")
class UserController extends ControllerBase {

  @Post('login')
  @Required(ParameterType.Body, [['code']])
  async SayHello(ctx: ParameterizedContext<any, {}>) {

      const { Wechat: { AppID, AppSecret } } = AppConfig

      ctx.body = `${ctx.request.body.code}, ${AppID}, ${AppSecret}`
      // try {
      //   const { data, status } = await axios.get(Code2SessionUrl(AppID, AppSecret, code))
      //   if (status === 200) {
      //     // request successful. begin reading user info.
      //     const { openid, session_key, errcode } = data
      //     // handle errcode sent by wechat server. more detailed see wechat miniprogram documents.
      //     switch (errcode) {
      //       case -1:
      //         ctx.body = {
      //           ErrCode: errcode,
      //           Reason: "Wechat server is busy. Please try again."
      //         }
      //         break;
      //       case 0:

      //         break;
      //       case 40029:
      //         ctx.body = {
      //           ErrCode: errcode,
      //           Reason: "Login code is invalid."
      //         }
      //         break;
      //       case 45011:
      //         ctx.body = {
      //           ErrCode: errcode,
      //           Reason: "Frequency limited. Each user should only call for login less than 100 times one minus."
      //         }
      //         break;
      //     }
      //   }
      // }
      // catch (error) {
      //   ctx.status = 400
      //   ctx.body = error
      // }
    
  }
}

export default UserController