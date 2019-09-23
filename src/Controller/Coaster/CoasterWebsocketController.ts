import { ControllerBase, WsController, WebSocketPath } from "../../Utils/Decorators/RouterDecorator";
import { MiddlewareContext } from 'koa-websocket'
import client from '../../Persistence/RedisConfig'
import { TryParseJSON } from "../../Utils/common";
import { CoasterUploadUserStatus, BindDevice } from "../../Service/device";


const PrepareToBindConnectionPool = new Map<string, [MiddlewareContext<any>, NodeJS.Timeout]>()
const PrepareToBindAliveDetector = new Map<string, number>()
const BindedCoasterConnection = new Map<string, string>()


function SetupWebsocketConnectionMaintainer(ctx: MiddlewareContext<any>, did: string) {
  return (aliveDetector: Map<string, number>, connectionPool: Map<string, [MiddlewareContext<any>, NodeJS.Timeout]>) => {
    const interval = setInterval(() => {
      const overTime = aliveDetector.get(did)
      if (overTime > 3) {
        ctx.websocket.close()
        return
      }
      ctx.websocket.ping('ping')
      aliveDetector.set(did, overTime + 1)
    }, 3 * 60 * 1000)

    ctx.websocket.on('pong', (data) => {
      aliveDetector.set(did, 0)
    })

    // 保存ctx 和 interval
    connectionPool.set(did, [ctx, interval])

    ctx.websocket.on('close', (code, reason) => {
      const [_, interval] = connectionPool.get(did)
      clearInterval(interval)
      connectionPool.delete(did)
      aliveDetector.delete(did)
      console.log(`${did} closed. Code: ${code}, Reason: ${reason}.`)
    })
  }
}


@WsController('coaster')
export default class CoasterWebsocketController extends ControllerBase {

  constructor() {
    super()
    this.CoasterPrepareToBind = this.CoasterPrepareToBind.bind(this)
    this.ValidateDid = this.ValidateDid.bind(this)
  }
  @WebSocketPath('discovery')
  async CoasterPrepareToBind(ctx: MiddlewareContext<any>) {
    const { did } = ctx.query

    if (!this.ValidateDid(did)) {
      ctx.websocket.close()
      return
    }

    SetupWebsocketConnectionMaintainer(ctx, did)(PrepareToBindAliveDetector, PrepareToBindConnectionPool)

    client.GET(did, (err, req) => {
      if (err) console.warn(`${did} cannot get bind request in redis.`)
      else if (req) {
        const bindReq = req.split(':')
        if (bindReq.length === 2 && bindReq[1] === '0') {

          // 说明当前服务器上有Pending请求未处理，立即将此请求发往客户端。
          RequestToBind(did, bindReq[0])
        }
      }
    })
  }

  /*
      原始数据样式:
      {
          "cmd": "bind",
          "uid": "用户的ID"
      }

      {
          "cmd": "env",
          "wet":20,
          "temp": 26.5
      }
      {
          "cmd": "drink",
          "vol": 200
      }
      {
          "cmd": "drink",
          "iv":"随机向量",
          "encrypted": {
              "content":"xxx",
              "tag":"base64 buffer"
          }
      }
  */
  @WebSocketPath('report')
  async CoasterReportUsageData(ctx: MiddlewareContext<any>) {
    const { did, type } = ctx.query
    if (!this.ValidateDid(did)) {
      ctx.websocket.close()
      return
    }

    ctx.websocket.on('message', (coasterData) => {
      // 做data的iv向量解密
      TryParseJSON(coasterData.toString())
        .then(async (message) => {
          switch (message.cmd) {
            case 'bind':
              console.log(`User ${message.uid} is now bind to coaster ${did}`)
              const PersistBindRelationship = await BindDevice(message.uid, did, type)
              if (PersistBindRelationship) {
                BindedCoasterConnection.set(did, message.uid)
                console.log(`杯垫 ${did} 与用户 ${message.uid} 成功完成绑定!`)
                ctx.websocket.send(JSON.stringify({
                  cmd: "bound"
                }))
              }
              break
            default:
              const uid = BindedCoasterConnection.get(did)
              if (!uid) console.warn("Bind uid not found. Cannot decrypt data.")
              else {
                // Call device service to persist user status data.
                CoasterUploadUserStatus(did, message)
              }
              break
          }
        }, err => console.warn(`${err}, Not json data, ignore.`))
    })

    ctx.websocket.on('close', () => {
      console.log(`${did} close connection.`)
    })
  }

  ValidateDid(did: string) {
    // Place validating request logic here. Here are still a stub.
    return did && did.length === 21
  }
}

export function RequestToBind(did: string, uid: string) {
  const [remoteCtx] = PrepareToBindConnectionPool.get(did) || []
  if (remoteCtx) {
    remoteCtx.websocket.send(JSON.stringify({
      cmd: 'bind',
      uid: uid
    }))
    return {
      StatusCode: 0 // 杯垫已经上线, 并且已成功发送绑定请求到杯垫
    }
  }
  // 否则将绑定请求存入Redis，等待杯垫上线后马上就能获得。
  // Pending bind request.
  client.SET(did, `${uid}:0`, 'EX', 3 * 60)
  return {
    StatusCode: 1
    // 杯垫不在线, 但是已经缓存3分钟请求到Redis, 当杯垫在3分钟以内上线就能立刻收到绑定请求
  }
}