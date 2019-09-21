import { KoaWithRouter, DiscoveryAllController } from './router-loader'

import * as bodyParser from 'koa-bodyparser'
import * as cors from '@koa/cors'


require('./auth')
require('./Persistence/config')

const app = new KoaWithRouter()

app.use(async (ctx,next) => {
    // Log out all requests
    console.log(`${ctx.method} => ${ctx.url}`)
    await next()
})
app.use(bodyParser())
app.use(cors())

app.use(async (ctx,next) => {
    try {
        await next()
    }
    catch (err) {
        console.log(`Global error handler - ${err}`)
        ctx.body = {
            StatusCode : -1000, 
            Error : err
        }
    }
})

app.LoadRouters(DiscoveryAllController())

const PORT = process.argv.slice(2)[0] || 3000

console.log(`Listening on ${PORT}...`)
app.listen(PORT)

