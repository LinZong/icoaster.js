import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import * as fs from 'fs'
import * as path from 'path'
import {JWTMiddleware} from './auth'

class KoaWithRouter extends Koa {
  LoadRouters(paths: KoaRouter[]) {
    const router = new KoaRouter()
    paths.forEach(it => router.use(it.routes()))
    this.use(router.routes())
  }
}

function Controller(Path: string, Method: string, body: Koa.Middleware, withAuth?: boolean) {
  Path = Path.startsWith('/') ? Path : `/${Path}`
  return [Path, Method, body, withAuth]
}

const SupportHttpMethod: string[] = ['get', 'post', 'put']

function DiscoveryAllController() {
  function JoinPath(...args: string[]) {
    return path.join(__dirname, 'Controller', ...args)
  }

  const result: KoaRouter[] = []
  const fileExtReg = /(\.js$|\.ts$|\.tsx$)/;
  const controllers = path.join(__dirname, 'Controller')
  fs.readdirSync(controllers).forEach(fd => {
   
    if (!fileExtReg.test(fd)) return

    const fileWithoutExt = fd.replace(fileExtReg, '')

    const loadPath = JoinPath(fd)
    const mod: [string, string, Koa.Middleware, string][] = require(loadPath).default
    if (mod instanceof Array) {
      const _router = new KoaRouter({ prefix: `/${fileWithoutExt}` })
      mod.forEach(([path, method, mw, withAuth]) => {
        const _method = method.toLowerCase()
        if (SupportHttpMethod.indexOf(_method) != -1) {
          // This is a correct controller, register it into router
          let middleware = [mw]
          if (withAuth) middleware.unshift(JWTMiddleware)
          switch (_method) {
            case 'get':
              _router.get(path, ...middleware)
              break;
            case 'post':
              _router.post(path, ...middleware)
              break;
            case 'put':
              _router.put(path, ...middleware)
              break;
          }
        }
      })
      result.push(_router)
    }
  })
  return result
}

export { Controller, KoaWithRouter, DiscoveryAllController }