import { KoaWithRouter, DiscoveryAllController } from './router-loader'

import * as bodyParser from 'koa-bodyparser'
import * as cors from '@koa/cors'

const app = new KoaWithRouter()

app.use(bodyParser())
app.use(cors())
app.LoadRouters(DiscoveryAllController())

const PORT = process.argv.slice(2)[0] || 3000

console.log(`Listening on ${PORT}...`)
app.listen(PORT)

