import { ControllerBase, WsController, WebSocketPath } from "../../Utils/Decorators/RouterDecorator";
import { MiddlewareContext } from 'koa-websocket'
import { Required, ParameterType } from "../../Utils/Decorators/ParameterValidatorDecorator";
import GetAES256GCMCipher from '../../Utils/AES256GCMCipher'
const PrepareToBindConnectionPool = new Map<string, [MiddlewareContext<any>, NodeJS.Timeout]>()
const PrepareToBindAliveDetector = new Map<string, number>()
const FakeBindCollection = new Map<string, string>()

const { Encrypter, Decrypter } = GetAES256GCMCipher()

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
    const { did } = ctx.query
    if (!this.ValidateDid(did)) {
      ctx.websocket.close()
      return
    }

    ctx.websocket.on('message', (coasterData) => {
      // 做data的iv向量解密
      TryParseJSON(coasterData.toString())
        .then((message) => {
          switch (message.cmd) {
            case 'bind':
              console.log(`User ${message.uid} is now bind to coaster ${did}`)
              FakeBindCollection.set(did, message.uid)
              break
            case 'env':
            case 'drink':
              const uid = FakeBindCollection.get(did)
              if (!uid) console.warn("Bind uid not found. Cannot decrypt data.")
              else {
                const { encrypted, iv } = message
                const strData = Decrypter(encrypted, did + uid, iv)
                TryParseJSON(strData).then(msg => console.log(msg), fail => console.error("Cannot parse data to json."))
              }
              break
          }
        }, fail => console.warn("Not json data, ignore."))
    })

    ctx.websocket.on('close', () => {
      console.log(`${did} close connection.`)
    })
  }

  ValidateDid(did: string) {
    // Place validating request logic here. Here are still a stub.
    return did && ['123456789123456739393', '654321'].includes(did)
  }
}

function TryParseJSON(text: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const data = JSON.parse(text)
      resolve(data)
    }
    catch {
      reject()
    }
  })
}

export function RequestToBind(did: string, uid: string) {
  const [remoteCtx] = PrepareToBindConnectionPool.get(did) || []
  if (remoteCtx) {
    remoteCtx.websocket.send(JSON.stringify({
      cmd: 'bind',
      uid: uid
    }))
    return 'Sent bind request to coaster.'
  }
  return 'Coaster is still offline now.'
}