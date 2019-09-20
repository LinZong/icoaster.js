import { Middleware } from "koa";

const METHOD_ATTRIBUTE = "method"
const PATH_ATTRIBUTE = "path"
const AUTHORIZE_ATTRIBUTE = "authorize"

export class ControllerBase { }

export interface IControllerBase { new(): IControllerBase }

export interface RouteInfo {
  root: string,
  subpath: string,
  method: string,
  fn: Middleware,
  authorize:boolean
}

// ------------- Helper ---------------
function isConstructor(f: { new(...args: any[]): {} }) {
  try {
    new f();
  } catch (err) {
    return false;
  }
  return true;
}

function isFunction(f: any) {
  return f instanceof Function
}

const SubPathMapptingFactory = (method: string) => (path: string): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(PATH_ATTRIBUTE, ResovlePath(path), descriptor.value)
    Reflect.defineMetadata(METHOD_ATTRIBUTE, method, descriptor.value)
  }
}

const Authorize = (target, propertyKey, descriptor)  => {
  Reflect.defineMetadata(AUTHORIZE_ATTRIBUTE, true, descriptor.value)
}

const [Get, Post, Put] = ['get', 'post', 'put'].map(it => SubPathMapptingFactory(it))

const ResovlePath = (path: string) => path[0] === '/' ? path : `/${path}`

// ------------- Decorator ---------------
const Controller = (path: string): ClassDecorator => {
  return target => {
    Reflect.defineMetadata(PATH_ATTRIBUTE, ResovlePath(path), target)
  }
}


const ValidatePath = (path: string) => path && path[0] === '/'

const ValidateDecorator = (subpath: string, method: string): boolean => {
  if (!ValidatePath(subpath)) return false;
  if (['get', 'post', 'put'].filter(it => method === it).length === 0) return false;
  return true;
}

const GetRouteAttribute = (ControllerClass : IControllerBase): [string, RouteInfo[]] => {

  const rootPath = Reflect.getMetadata(PATH_ATTRIBUTE, ControllerClass) as string
  if (ValidatePath(rootPath)) {

    const controllerInstance = new ControllerClass()
    const prototype = Object.getPrototypeOf(controllerInstance)

    const methodsNames = Object.getOwnPropertyNames(prototype)
      .filter(item => !isConstructor(prototype[item]) && isFunction(prototype[item]))

    const routeInfo: RouteInfo[] = []

    methodsNames.forEach(name => {
      const fn = prototype[name]

      const subpath = Reflect.getMetadata(PATH_ATTRIBUTE, fn)
      const method = Reflect.getMetadata(METHOD_ATTRIBUTE, fn)
      const authorize = Reflect.getMetadata(AUTHORIZE_ATTRIBUTE, fn) || false

      if (ValidateDecorator(subpath, method)) {
        routeInfo.push({
          root: rootPath,
          subpath: subpath,
          method: method,
          fn: fn,
          authorize: authorize
        })
        console.log(`Path is ${rootPath}${subpath} : ${method}. Added to router.`)
      }
    })
    return [rootPath, routeInfo]
  }
}



export { GetRouteAttribute, Controller, Get, Post, Put, Authorize }