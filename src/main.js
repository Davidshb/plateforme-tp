const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const host = '0.0.0.0' // Utiliser 0.0.0.0 pour être visible depuis l'exterieur de la machine
const jwt = require('jsonwebtoken')
const validate = require("jsonschema").validate
const randomWords = require("random-words")

const schemas = require("./schema.json")

require('dotenv').config()

const port = process.env.PORT || 5000

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

function run() {

	app.use(bodyParser.json())

	app.post("/login", (req, res) => {
		const t = validate(req.body, schemas.loginSchema)

		if (!t.valid)
			return jsonSchemaInvalid(res, t.errors.map(elem => elem.message))

		let {login, password} = req.body
		res.setHeader('Content-Type', 'application/json')

		if (login !== process.env.LOGIN || password !== process.env.PASSWORD)
			return res.status(401)
				.end(JSON.stringify({code: -1}))

		let token = jwt.sign({username: login}, process.env.MY_KEY, {algorithm: "HS512", expiresIn: 3600})

		res.send(JSON.stringify({
			code: 0,
			token
		}))
	})

	app.post('/pushdata', (req, res) => {
			let {token, data} = req.body
			const t = validate(req.body, schemas.pushDataSchema)

			if (!t.valid)
				return jsonSchemaInvalid(res, t.errors.map(elem => elem.message))

			let decoded = check_jwt(token)

			if (decoded.error)
				return res.status(401)
					.end(JSON.stringify({code: -1, message: decoded.message}))

			console.log("donnée reçue par le client : " + data)
			let end = Math.random() > .75 // la probabilité que le serveur disent de terminer est de 75%
			console.log("terminer l'envoi -> " + end ? "oui" : "non")
			if (end)
				res.end(JSON.stringify({command: "end"}))
			else
				res.end(JSON.stringify({command: "log", data: randomWords({min: 3, max: 10}).join(' ')}))
		}
	)

	app.get('/*', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.status(404)
		res.end(JSON.stringify({"message": "invalid url", code: -1}))
	})

	app.post('/*', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.status(404)
		res.end(JSON.stringify({"message": "invalid url", code: -1}))
	})

	app.listen(port, host, () => {
		console.log(`Server is running at http://${host}:${port}`)
	})
}

exports.run = run
