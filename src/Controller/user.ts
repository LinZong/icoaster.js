import * as UserService from '../Service/user'
import axios from 'axios'
import { ControllerBase, Controller, Get, Post, isConstructor, Authorize } from '../Utils/Decorators/RouterDecorator';
import { ParameterizedContext } from 'koa';
import { Required, ParameterType } from '../Utils/Decorators/ParameterValidatorDecorator';
import { INotificationSetting, UserNotifySetting, MobileNotificationSetting, CoasterNotificationSetting, UserProfile } from '../Persistence/Model/User'
import { GetUIDFromToken } from '../Utils/common';
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


  @Get('notify')
  @Authorize
  async GetNotifyPolicy(ctx: ParameterizedContext) {

    ctx.body = await UserNotifySetting
      .findByPk(GetUIDFromToken(ctx.header))
      .then(found => {
        return {
          StatusCode: found ? 0 : -1,
          Mobile: found.MobileMask,
          Coaster: found.CoasterMask
        }
      })
      .catch(err => {
        console.error(err)
        return {
          StatusCode: -2
        }
      })
  }

  @Post('notify')
  @Authorize
  @Required(ParameterType.Body, [['Mobile', ValidatorFactory(MobileNotificationSetting)],
                                 ['Coaster', ValidatorFactory(CoasterNotificationSetting)]])
  async UpdateNotifyPolicy(ctx: ParameterizedContext) {
    const { Coaster, Mobile } = ctx.request.body
    ctx.body = await UserNotifySetting
      .upsert({
        UID: GetUIDFromToken(ctx.header),
        CoasterMask: Coaster,
        MobileMask: Mobile
      })
      .thenReturn({
        StatusCode: 0
      })
      .catch(err => {
        console.error(`${this.UpdateNotifyPolicy.name} - ${err}`)
        return {
          StatusCode: -1
        }
      })
  }

  @Get('profile')
  @Authorize
  async GetUserProfile(ctx: ParameterizedContext) {
    const UID = GetUIDFromToken(ctx.header)
    ctx.body = await UserProfile.findByPk(UID)
      .then(prof => {
        if (prof) {
          const { Sex, Birthday, Height, Weight, Healthy } = prof
          return {
            StatusCode: 0,
            Sex, Birthday, Height, Weight, Healthy
          }
        }
        return {
          StatusCode: -1
        }
      })
  }

  @Post('profile')
  @Authorize
  @Required(ParameterType.Body, [['Sex'], ['Birthday'], ['Height'], ['Weight'], ['Healthy']])
  async UpdateUserProfile(ctx: ParameterizedContext) {
    const UID = GetUIDFromToken(ctx.header)
    ctx.body = await UserProfile.upsert({ UID: UID, ...ctx.request.body })
      .thenReturn({ StatusCode: 0 })
      .catchReturn({ StatusCode: -1 })
  }
} 

function ValidatorFactory(type: INotificationSetting) {
  return function (settings): boolean {
    const instance = new type()
    const properties = Object.getOwnPropertyNames(instance).filter(it => !isConstructor(instance[it]))
    for (const name of properties) {
      if (!settings.hasOwnProperty(name)) return false
    }
    return true
  }
}

export default UserController