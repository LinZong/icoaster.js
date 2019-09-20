import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import * as fs from 'fs'
import * as path from 'path'
import {JWTMiddleware} from './auth'
import { ControllerBase, GetRouteAttribute } from './Utils/Decorators/RouterDecorator';

class KoaWithRouter extends Koa {
  LoadRouters(paths: KoaRouter[]) {
    const router = new KoaRouter()
    paths.forEach(it => router.use(it.routes()))
    this.use(router.routes())
  }
}

function DiscoveryAllController() {
  function JoinPath(...args: string[]) {
    return path.join(__dirname, 'Controller', ...args)
  }

  const result: KoaRouter[] = []
  const fileExtReg = /(\.js$|\.ts$|\.tsx$)/;
  const controllers = path.join(__dirname, 'Controller')
  fs.readdirSync(controllers).forEach(fd => {

    if (!fileExtReg.test(fd)) return

    const loadPath = JoinPath(fd)
    const controller = require(loadPath).default
    if (controller && controller.prototype instanceof ControllerBase) {
      // Begin extract router info from decorator
      const info = GetRouteAttribute(controller)
      if (info) {
        const [rootPath, routeInfo] = info
        const __router = new KoaRouter({ prefix: rootPath })
        routeInfo.forEach(r => {
          let fnList = [r.fn]

          if(r.authorize) fnList.unshift(JWTMiddleware)
          if(r.validator) fnList.unshift(r.validator)

          __router[r.method](r.subpath,...fnList)
        })
        result.push(__router)
      }
    }
  })
  return result
}

export { KoaWithRouter, DiscoveryAllController }