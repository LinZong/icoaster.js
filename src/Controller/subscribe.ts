import { ControllerBase, Controller, Get, Authorize } from '../Utils/Decorators/RouterDecorator';
import { Required, ParameterType } from '../Utils/Decorators/ParameterValidatorDecorator';
import { ParameterizedContext } from 'koa';
import { UserAccount } from '../Persistence/Model/User';
import { GetUIDFromToken } from '../Utils/common';
import { UserSubscribe, QuerySubscribeUser } from '../Persistence/Model/Subscribe';



@Controller('user')
export default class SubscribeController extends ControllerBase {


  @Get('subscribe')
  @Authorize
  @Required(ParameterType.QueryString, [['query']])
  async GetUserForSubscribe(ctx: ParameterizedContext) {
    const { query } = ctx.query
    const MyUID = GetUIDFromToken(ctx.header)

    switch (query) {
      case 'my': {
        // 查询关注我的所有用户UID
        const [result] = await UserSubscribe.sequelize.query(QuerySubscribeUser('subscribe', MyUID))
        ctx.body = result
        break
      }

      case 'all': {
        // 查询我关注的所有用户UID
        const [result] = await UserSubscribe.sequelize.query(QuerySubscribeUser('uid', MyUID))
        ctx.body = result
        break
      }

      default: {
        // 查询指定用户的缩略信息，展示到查询页面上
        ctx.body = await UserAccount.findOne({ where: { UID: query } }).then(p => {
          if (p) {
            return {
              StatusCode: 0,
              UID: p.UID,
              NickName: p.NickName,
              AvatarUrl: p.AvatarUrl
            }
          }
          return {
            StatusCode: -1
          }
        })
        break
      }
    }
  }


  @Get('bind')
  @Authorize
  @Required(ParameterType.QueryString, [['uid']])
  async RequestBind(ctx: ParameterizedContext) {

    const { uid } = ctx.query
    const tag = ctx.query.tag || ''
    const confirm = ctx.query.confirm

    const beSubscribed = await UserAccount.findOne({ where: { UID: uid } })
    if (!beSubscribed) {
      ctx.body = { StatusCode: -1 }
      return
    }
    
    else {
      try {
        await UserSubscribe.upsert({
          UID: confirm ? confirm : GetUIDFromToken(ctx.header),
          SubscribeUserUID: confirm ? GetUIDFromToken(ctx.header) : uid,
          IsEmergencyContact: 0,
          Tag: !confirm ? tag : undefined,
          RequestBind: confirm ? 0 : 1
        })
        ctx.body = { StatusCode: 0 }
      }
      catch (err) {
        console.log(err)
        ctx.body = { StatusCode: -2 }
      }
    }
  }
}
