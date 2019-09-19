import { Controller } from '../router-loader'
import { touch } from '../Utils/common'
import axios from 'axios'
const AppConfig = require('../../app.json')

const Code2SessionUrl = (AppID: string, AppSecret: string, code: string | any): string => `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`

const Login = Controller('login', 'get', async ctx => {
    await touch<string>(ctx.query.code)
        .then(async code => {
            const { Wechat: { AppID, AppSecret } } = AppConfig
            // send request to wx server.
            ctx.body = Code2SessionUrl(AppID, AppSecret, code)
        }, _ => {
            ctx.body = {
                Reason: "Wechat app login code is invalid."
            }
        })
})

const BindCoaster = Controller('bind','post',async ctx => {
    
})

const SayHello = Controller('hello','get',async ctx => ctx.body = "Hello!")

export default [ Login,SayHello ]