let config
const argv = process.argv.slice(2)
if(argv.length === 0){
    config = require('../app.json')
    console.warn(`Config file app.json loaded!`)
}
else {
    const env = argv[0]
    config = require(`../app-${env}.json`)
    console.warn(`Config file app-${env}.json loaded!`)
}


module.exports = config