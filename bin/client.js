const redis = require("redis")
const {promisify} = require("util")

const client = redis.createClient()
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

setAsync("cle", "Germain")
	.then(console.log)
	.then(() => getAsync("cle"))
	.then(console.log)
	.catch(console.error)
	.finally(() => client.end(true))


