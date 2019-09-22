import { ControllerBase, Controller, Get, Authorize, Post } from '../Utils/Decorators/RouterDecorator';
import { Required, ParameterType } from '../Utils/Decorators/ParameterValidatorDecorator';
import { ParameterizedContext } from 'koa';
import { GetUIDFromToken } from '../Utils/common';
import * as moment from 'moment'

import { GetUserDrinkingRecords } from '../Service/drinking';

@Controller('drinking')
export default class DrinkingController extends ControllerBase {

  @Get('today')
  @Authorize
  @Required(ParameterType.QueryString, [['user', (test) => test === 'my' || /^[0-9a-z]{11}$/.test(test)]])
  async GetTodayDrinkingRecords(ctx: ParameterizedContext) {
    const { user } = ctx.query
    const QueryUserUID = user === 'my' ? GetUIDFromToken(ctx.header) : user
    const now = moment().unix()
    const yesterday = moment().subtract(1, 'days').unix()
    ctx.body = GetUserDrinkingRecords(QueryUserUID, yesterday, now)
  }

  @Get('enviromnent')
  @Authorize
  @Required(ParameterType.QueryString, [['user', (test) => test === 'my' || /^[0-9a-z]{11}$/.test(test)]])
  async GetUserCoasterEnvironmentReport(ctx: ParameterizedContext) {
    ctx.body = "Stub method."
  }
}