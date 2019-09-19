"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_loader_1 = require("./router-loader");
const app = new router_loader_1.KoaWithRouter();
app.LoadRouters(router_loader_1.DiscoveryAllController());
const PORT = process.argv.slice(2)[0] || 3000;
console.log(`Listening on ${PORT}...`);
app.listen(PORT);
//# sourceMappingURL=app.js.map