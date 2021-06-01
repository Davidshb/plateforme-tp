require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const path = require("path")

const {redis_get} = require("../common/functions")

const port = process.env.REST_PORT || 5010
const host = '0.0.0.0'

function run () {
	const app = express()

	app.use(bodyParser.json())

	app.set("view engine", "ejs")
	app.set('views', path.join(__dirname, '/template'));

	app.get("/temp(/:ville)?", (req, res) => {

		let ville = req.params.ville
		if(ville == null)
			return res.render("index")

		redis_get(ville.toLowerCase()).then(temp => {
			if(!temp)
				return res.status(404).json({message: "ville introuvable"})
			res.render("index", {temp})
		})
	})

	app.get('/*', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.status(404)
		res.end(JSON.stringify({"message": "invalid url", code: -1}))
	})

	app.listen(port, host, () => {
		console.log(`Rest is running at http://localhost:${port}`)
	})
}

exports.run = run
