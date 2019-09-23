import * as redis from 'redis'
const { Database: { Redis } } = require('../../app.json')
const RedisClient = redis.createClient(Redis)
    .once('ready', console.log.bind(console, 'Redis connected!'))

RedisClient.on('error', console.error.bind(console, 'Redis connection error:'));

export default RedisClient