import { ControllerBase, Controller, Get, Post, Authorize } from "../Utils/Decorators/RouterDecorator";
import { Required, ParameterType } from "../Utils/Decorators/ParameterValidatorDecorator";
import { ParameterizedContext } from 'koa';
import { GetUIDFromToken } from '../Utils/common'
import * as DeviceService from '../Service/device'
import { RequestToBind } from "./Coaster/CoasterWebsocketController";

@Controller("device")
class DeviceController extends ControllerBase {

 
  // @Authorize
  @Post('bind')
  @Required(ParameterType.Body, [['did']])
  async RequestBindDevice(ctx: ParameterizedContext) {
    // const UID = GetUIDFromToken(ctx.header)
    // 首先检查这个用户有没有已经绑定的Device, 如果有, 应拒绝绑定
    const UID = '3ijdiz7hjxg'
    // const { StatusCode } = await DeviceService.GetBindDevice(UID)
    // if(StatusCode === 0) {
    //   ctx.body = {
    //     StatusCode : -1
    //   }
    //   return
    // }
    const { did } = ctx.request.body
    ctx.body = RequestToBind(did, UID)
  }

  @Get('bind')
  @Authorize
  async GetBindDevice(ctx: ParameterizedContext) {
    ctx.body = await DeviceService.GetBoundDevice(
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