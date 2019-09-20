"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_loader_1 = require("./router-loader");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
require('./auth');
require('./Persistence/config');
const app = new router_loader_1.KoaWithRouter();
app.use(bodyParser());
app.use(cors());
app.use(async (ctx, next) => {
    // Log out all requests
    await next();
    console.log(`${ctx.method} => ${ctx.url}`);
});
app.LoadRouters(router_loader_1.DiscoveryAllController());
const PORT = process.argv.slice(2)[0] || 3000;
console.log(`Listening on ${PORT}...`);
app.listen(PORT);
//# sourceMappingURL=app.js.map