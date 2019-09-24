import * as Mongoose from 'mongoose'
const AppConfig = require('../config-loader')
const mongoose = Mongoose.createConnection(AppConfig.Database.Mongo, { useNewUrlParser : true, useUnifiedTopology: true })
mongoose.on('error', console.error.bind(console, 'connection error:'));
mongoose.once('open', console.log.bind(console, 'Mongoose connected!'))
export default mongoose