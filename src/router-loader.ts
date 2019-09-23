import * as KoaRouter from 'koa-router'
import * as fs from 'fs'
import * as path from 'path'
import { JWTMiddleware } from './auth'
import { ControllerBase, GetRouteAttribute } from './Utils/Decorators/RouterDecorator';
import { App } from 'koa-websocket';

const rootDir = path.join(__dirname, 'Controller')

const fileExtReg = /(\.js$|\.ts$|\.tsx$)/

function LoadRouters(app : App,walkingDir : string = rootDir) {

  function JoinPath(walkingDir : string, file: string) {
    return path.join(walkingDir,file)
  }

  fs.readdirSync(walkingDir).forEach(fd => {
    if(fs.statSync(JoinPath(walkingDir,fd)).isDirectory()) {
      LoadRouters(app,path.join(rootDir,fd))
      return
    }
    if (!fileExtReg.test(fd)) return
    const loadPath = JoinPath(walkingDir,fd)
    const controller = require(loadPath).default
    if (controller && controller.prototype instanceof ControllerBase) {
      // Begin extract router info from decorator
      const info = GetRouteAttribute(controller)
      if (info) {
        const [rootPath, routeInfo,isWebsocket] = info
        const __router = new KoaRouter({ prefix: rootPath })
        routeInfo.forEach(r => {
          let fnList = [r.fn]

          if(r.authorize) fnList.unshift(JWTMiddleware)
          if(r.validator) fnList.unshift(r.validator)

          __router[r.method](r.subpath,...fnList)
        })

        if(isWebsocket) app.ws.use(__router.routes() as any)
        else app.use(__router.routes())
      }
    }
  })
}


export { LoadRouters }