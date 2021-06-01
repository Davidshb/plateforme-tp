require('dotenv').config()
const amqp = require("amqplib")
const redis = require("redis")
const {promisify} = require("util")

function amqp_connect() {
	const IP = process.env.RABBIT_MQ_IP || "127.0.0.1",
		username = process.env.AMQP_USER || "guest",
		password = process.env.AMQP_PASSWORD || "guest"

	return amqp.connect("amqp://" + IP, {credentials: amqp.credentials.plain(username, password)})
		.then(connection => connection.createChannel())
}

exports.redis_get = (cle, db = 0) => {
	const client = redis.createClient({db})
	const getAsync = promisify(client.get).bind(client)
	return getAsync(cle).then(valeur => {
		client.end(true)
		return valeur
	})
}

exports.redis_set = (cle, valeur, db = 0) => {
	const client = redis.createClient({db})
	const setAsync = promisify(client.set).bind(client)
	return setAsync(cle, valeur).then(() => client.end(true))
}

exports.amqp_connect = amqp_connect

exports.is_dev_env = () => process.env.NODE_ENV === "development"
