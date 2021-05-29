require("dotenv").config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const host = '0.0.0.0' // Utiliser 0.0.0.0 pour être visible depuis l'exterieur de la machine
const port = process.env.PORT || 8000
const jwt = require('jsonwebtoken')
const validate = require('jsonschema').validate
const amqp = require("amqplib")
const schemas = require("./schema.json")
const {check_ident} = require('./db/authdb')
const {routeur} = require("./router")
const {display_all} = require("./display")

const backend_queue = "from_backend"
const my_key = process.env.MY_KEY
const TOKEN_LIFE = 600
const opt = {
	credentials: amqp.credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASSWORD)
}
const IP = process.env.RABBIT_MQ_IP || "127.0.0.1"

function run() {

	app.use(bodyParser.json())

	const amqp_open = amqp.connect(`amqp://${IP}`, opt)

	function jsonSchemaInvalid(res, messages) {
		res.send(JSON.stringify({
			code: -1,
			message: messages
		}))
	}

	function check_jwt(token) {
		let res
		try {
			//console.log("auth :\n---------------------------------------")
			res = jwt.verify(token, process.env.MY_KEY, {algorithm: "HS512"})
			//console.log(res)
		} catch (err) {
			console.log(err.message)
			res = {
				error: true,
				message: err.message
			}
		}
		//console.log("----------------------------------------")
		return res
	}

	function login(req, res) {
		const t = validate(req.body, schemas.loginSchema)

		if (!t.valid)
			return jsonSchemaInvalid(res, t.errors.map(elem => elem.message))

		let {login, password} = req.body
		res.setHeader('Content-Type', 'application/json')

		if (!check_ident(login, password))
			return res.status(401)
				.end(JSON.stringify({code: -1}))

		let token = jwt.sign({username: login}, my_key, {algorithm: "HS512", expiresIn: TOKEN_LIFE})

		res.send(JSON.stringify({
			code: 0,
			token
		}))
	}

	function pushdata(req, res) {
		let {token, code, data} = req.body
		const t = validate(req.body, schemas.pushDataSchema)

		if (!t.valid)
			return jsonSchemaInvalid(res, t.errors.map(elem => elem.message))

		let decoded = check_jwt(token)

		if (decoded.error)
			return res.status(401).end(JSON.stringify({code: -1, message: decoded.message}))

		return amqp_open
			.then(connection => connection.createChannel())
			.then(channel => {
				return channel.assertQueue(backend_queue, {
					durable: true
				}).then(() => channel.sendToQueue(backend_queue, Buffer.from(JSON.stringify({
					username: decoded.username,
					code,
					data
				})), {noAck: true}))
			}).catch(error => {
				console.log("error : %s", error.message)
				process.exit(-2)
			})
			.then(() => res.send(JSON.stringify({data: "merci " + decoded.username})))
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

	routeur(amqp_open, backend_queue)
	display_all(amqp_open)
}

exports.run = run
