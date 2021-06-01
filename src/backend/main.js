require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const validate = require("jsonschema").validate
const jwt = require('jsonwebtoken')

const schemas = require("../schemas.json")
const {is_dev_env, amqp_connect} = require("../common/functions")
const {get_autorisations, check_ident} = require("../db/authdb")

const MY_KEY = process.env.MY_KEY || "foufou"
const port = process.env.BACKEND_PORT || 5000

const ACCESS_TOKEN_LIFE = 3600
const backend_queue = "backend"
const host = '0.0.0.0' // Utiliser 0.0.0.0 pour être visible depuis l'exterieur de la machine

let backend_channel

function jsonSchemaInvalid(res, messages) {
	res.send(JSON.stringify({
		code: -1,
		message: messages
	}))
}

function check_jwt(token) {
	let res
	try {
		res = jwt.verify(token, process.env.MY_KEY, {algorithm: "HS512"})
	} catch (err) {
		console.log(err.message)
		res = {
			error: true,
			message: err.message
		}
	}
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

	let token = jwt.sign({username: login}, MY_KEY, {algorithm: "HS512", expiresIn: ACCESS_TOKEN_LIFE})

	res.send(JSON.stringify({
		code: 0,
		token
	}))
}

function pushdata(req, res) {
	let {token, destination, data} = req.body

	const t = validate(req.body, schemas.pushDataSchema)

	if (!t.valid)
		return jsonSchemaInvalid(res, t.errors.map(elem => elem.message))

	let decoded = check_jwt(token)

	if (decoded.error)
		return res.status(401).end(JSON.stringify({code: -1, message: decoded.message}))

	backend_channel.sendToQueue(backend_queue, Buffer.from(JSON.stringify({
		username: decoded.username,
		destination,
		data
	})), {noAck: true})

	res.send(JSON.stringify({data: "merci " + decoded.username}))
}

function run() {
	const app = express()

	app.use(bodyParser.json())

	app.post("/login", login)

	app.post('/pushdata', pushdata)

	if(is_dev_env())
	app.get("/autorisations", (req, res) => {
		return get_autorisations()
			.then(res => {
				let r_html = "<table>"
				res.forEach(elem => {
					r_html += "<tr><td>" + elem.login + "</td><td>" + elem.code.toString() + "</td></tr>"
				})
				r_html += "</table>"
				return r_html
			}).then((r_html) => res.send(r_html))
	})

	app.get('/*', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.status(404)
		res.end(JSON.stringify({"message": "invalid url", code: -1}))
	})

	app.listen(port, host, () => {
		console.log(`Backend is running at http://localhost:${port}`)
	})
}

exports.run = () => {
	amqp_connect()
		.then(channel => {
			channel.assertQueue(backend_queue, {
				durable: true
			})

			backend_channel = channel
			run()
		})
}

exports.backend_queue = backend_queue
