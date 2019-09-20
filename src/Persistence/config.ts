import { Sequelize } from 'sequelize-typescript'

import UserAccount from './Model/UserAccount'


const { Database: { MySQL } } = require('../../app.json')

const { UserName, Password, Host, Port, Database } = MySQL
const sequelize = new Sequelize(Database, UserName, Password, {
    host: Host,
    port:Port,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        idle: 30000
    }
});
sequelize.addModels([UserAccount])

console.log("Sequelize Loaded!")

export default sequelize