require("dotenv").config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const host = '0.0.0.0' // Utiliser 0.0.0.0 pour être visible depuis l'exterieur de la machine
const port = process.env.PORT || 8000
const jwt = require('jsonwebtoken')
const validate = require('jsonschema').validate
const amqp = require("amqplib/callback_api")
const schemas = require("./schema.json")
const {identifiants} = require('./authdb')

const my_key = process.env.MY_KEY
const TOKEN_LIFE = 600
const opt = {
	credentials: require("amqplib").credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASSWORD)
}
const IP = process.env.RABBIT_MQ_IP || "127.0.0.1"

amqp.connect(`amqp://${IP}`, opt, (error0, connection) => {
	if (error0) {
		console.log("error 0 : %s", error0.message)
		process.exit(-1)
	}

	connection.createChannel((error1, channel) => {
		if (error1) {
			console.log("error1 : %s", error1.message)
			process.exit(-2)
		}

		let queue = "from_backend"

		channel.assertQueue(queue, {
			durable: true
		})

		channel.consume(queue, msg => console.log("queue %s : message -> %s", queue, msg.content.toString()))
	}, {
		noAck: true
	})
})

function run() {

	app.use(bodyParser.json())

	function jsonSchemaInvalid(res, messages) {
		res.send(JSON.stringify({
			code: -1,
			message: messages
		}))
	}

	function check_jwt(token) {
		let res = null
		try {
			console.log("auth :\n---------------------------------------")
			res = jwt.verify(token, process.env.MY_KEY, {algorithm: "HS512"})
			console.log(res)
		} catch (err) {
			console.log(err.message)
			res = {
				error: true,
				message: err.message
			}
		}
		console.log("----------------------------------------")
		return res
	}

	function login(req, res) {
		const t = validate(req.body, schemas.loginSchema)

		if (!t.valid)
			return jsonSchemaInvalid(res, t.errors.map(elem => elem.message))

		let {login, password} = req.body
		res.setHeader('Content-Type', 'application/json')

		if (!identifiants.some(elem => elem.login === login && elem.password === password))
			return res.status(401)
				.end(JSON.stringify({code: -1}))

		let token = jwt.sign({username: login}, my_key, {algorithm: "HS512", expiresIn: TOKEN_LIFE})

		res.send(JSON.stringify({
			code: 0,
			token
		}))
	}

	function pushdata(req, res) {
		let {token, code} = req.body
		const t = validate(req.body, schemas.pushDataSchema)

		if (!t.valid)
			return jsonSchemaInvalid(res, t.errors.map(elem => elem.message))

		let decoded = check_jwt(token)

		if (decoded.error)
			return res.status(401)
				.end(JSON.stringify({code: -1, message: decoded.message}))

		console.log("code reçu " + code)

		res.send(JSON.stringify({data: "merci"}))
	}

	app.post("/login", login)

	app.post('/pushdata', pushdata)

	app.get('/*', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.status(404)
		res.end(JSON.stringify({"message": "invalid url", code: -1}))
	})

	app.listen(port, host, () => {
		console.log(`Server is running at http://${host}:${port}`)
	})
}

exports.run = run
