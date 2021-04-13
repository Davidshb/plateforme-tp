require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const host = '0.0.0.0' // Utiliser 0.0.0.0 pour être visible depuis l'exterieur de la machine
const port = 5000
const jwt = require('jsonwebtoken')

const LOGIN = process.env.LOGIN ||"test"
const PASSWORD = process.env.PASSWORD || "pass"
const MY_KEY = "foufou"


function run() {

	app.use(bodyParser.json())

	app.post("/login", (req, res) => {
		let {login, password} = req.body
		res.setHeader('Content-Type', 'application/json')

		if (login !== LOGIN || password !== PASSWORD)
			return res.status(401)
				.end(JSON.stringify({code: -1}))

		let token = jwt.sign({username: login}, MY_KEY, {algorithm: "HS512", expiresIn: 3600})

		res.send(JSON.stringify({
			code: 0,
			token
		}))
	})

	app.post('/pushdata', (req, res) => {
			let {token, data} = req.body

			console.log("token : ")
			console.log(token)


			jwt.verify(token, MY_KEY, {algorithm: "HS512"}, (err, decoded) => {
				if (err) {
					console.log(err.message)
					return res.status(401)
						.end(JSON.stringify({code: -1, message: err.message}))
				}

				console.log("decodé : ")
				console.log(decoded)

				res.status(201)
					.end(JSON.stringify({code: 0}))
			})

		}
	)

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
