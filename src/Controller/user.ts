import { GetUIDFromToken } from '../Utils/common'
import * as UserService from '../Service/user'
import axios from 'axios'
import { ControllerBase, Controller, Get, Authorize, Post } from '../Utils/Decorators/RouterDecorator';
import { ParameterizedContext } from 'koa';
import { Required, ParameterType } from '../Utils/Decorators/ParameterValidatorDecorator';
const AppConfig = require('../../app.json')
const Code2SessionUrl = (AppID: string, AppSecret: string, code: string | any): string => `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`



@Controller("user")
class UserController extends ControllerBase {

  @Get('login')
  @Required(ParameterType.QueryString, [['code']])
  async ReportLogin(ctx: ParameterizedContext<any, {}>) {
    const { Wechat: { AppID, AppSecret } } = AppConfig
    try {
      const { data, status } = await axios.get(Code2SessionUrl(AppID, AppSecret, ctx.query.code))
      if (status === 200) {
        // request successful. begin reading user info.
        const { openid, session_key, errcode, errmsg } = data
        // handle errcode sent by wechat server. more detailed see wechat miniprogram documents.
        if (errcode) {
          ctx.status = 400
          ctx.body = { ErrCode: errcode, Reason: errmsg }
          return
        }
        
        ctx.body = await UserService.Login(openid, session_key)
      }
    }
    catch (error) {
      ctx.status = 503
      ctx.body = error
    }
  }

  @Post('bind')
  @Required(ParameterType.Body, [['did'], ['type', (test) => [0, 1].includes(test)]])
  async BindDevice(ctx: ParameterizedContext) {
    const UID = GetUIDFromToken(ctx.header)
    const { did, type } = ctx.request.body
    ctx.body = await UserService.BindDevice(UID, did, type)
  }

  @Get('bind')
  async GetBindDevice(ctx : ParameterizedContext) {
    ctx.body =  await UserService.GetBindDevice(
      GetUIDFromToken(ctx.header)
    )
  }

  @Post('unbind')
  @Required(ParameterType.Body,[['did']])
  async UnbindDevice(ctx : ParameterizedContext) {
    const { did } = ctx.request.body
    ctx.body = await UserService.UnbindDevice(GetUIDFromToken(ctx.header),did)
  }
}

export default UserController