"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const UserAccount_1 = require("./Model/UserAccount");
const { Database: { MySQL } } = require('../../app.json');
const { UserName, Password, Host, Port, Database } = MySQL;
const sequelize = new sequelize_typescript_1.Sequelize(Database, UserName, Password, {
    host: Host,
    port: Port,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        idle: 30000
    }
});
sequelize.addModels([UserAccount_1.default]);
console.log("Sequelize Loaded!");
exports.default = sequelize;
//# sourceMappingURL=config.js.map