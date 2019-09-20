import { KoaWithRouter, DiscoveryAllController } from './router-loader'

import * as bodyParser from 'koa-bodyparser'
import * as cors from '@koa/cors'


require('./auth')
require('./Persistence/config')

const app = new KoaWithRouter()

app.use(bodyParser())
app.use(cors())
app.use(async (ctx,next) => {
    // Log out all requests
    await next()
    console.log(`${ctx.method} => ${ctx.url}`)
})
app.LoadRouters(DiscoveryAllController())

const PORT = process.argv.slice(2)[0] || 3000

console.log(`Listening on ${PORT}...`)
app.listen(PORT)

