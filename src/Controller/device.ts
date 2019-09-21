import { ControllerBase, Controller, Get, Post, Authorize } from "../Utils/Decorators/RouterDecorator";
import { Required, ParameterType } from "../Utils/Decorators/ParameterValidatorDecorator";
import { ParameterizedContext } from 'koa';
import { GetUIDFromToken } from '../Utils/common'
import * as DeviceService from '../Service/device'

@Controller("device")
class DeviceController extends ControllerBase {

  @Post('bind')
  @Authorize
  @Required(ParameterType.Body, [['did'], ['type', (test) => [0, 1].includes(test)]])
  async BindDevice(ctx: ParameterizedContext) {
    const UID = GetUIDFromToken(ctx.header)
    const { did, type } = ctx.request.body
    ctx.body = await DeviceService.BindDevice(UID, did, type)
  }

  @Get('bind')
  @Authorize
  async GetBindDevice(ctx: ParameterizedContext) {
    ctx.body = await DeviceService.GetBindDevice(
      GetUIDFromToken(ctx.header)
    )
  }

  @Get('unbind')
  @Authorize
  @Required(ParameterType.QueryString, [['did']])
  async UnbindDevice(ctx: ParameterizedContext) {
    const { did } = ctx.query
    ctx.body = await DeviceService.UnbindDevice(GetUIDFromToken(ctx.header), did)
  }
}

export default DeviceController