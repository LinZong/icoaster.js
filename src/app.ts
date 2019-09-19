import { KoaWithRouter, DiscoveryAllController } from './router-loader'


const app = new KoaWithRouter()

app.LoadRouters(DiscoveryAllController())

const PORT = process.argv.slice(2)[0] || 3000

console.log(`Listening on ${PORT}...`)
app.listen(PORT)

