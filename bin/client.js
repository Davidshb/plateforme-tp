const http = require('http')
const randomWords = require('random-words')

const data_login = JSON.stringify({
	login: "test",
	password: "pass"
})

const options_login = {
	hostname: 'localhost',
	port: 5000,
	path: '/login',
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
}


const options_pushdata = {
	...options_login,
	path: '/pushdata'
}

const PUSHDATA_INTERVAL = 2000

const my_request = (_options, _data) => {
	_options.headers["Content-Length"] = _data.length

	return new Promise((resolve, reject) => {
		const req = http.request(_options, res => {
			// variable de débug
			//console.log(`requête vers ${_options.path} statusCode: ${res.statusCode}`)

			res.on('data', d => {
				resolve(JSON.parse(d.toString()))
			})
		})

		req.on('error', error => {
			reject(error)
		})

		req.write(_data)
		req.end()
	})
}

my_request(options_login, data_login)// je me log dans un premier temps
	.then(res => res.token)
	.then(token => { // avec le token j'envoie les données
		let open_dialog = setInterval(() => my_request(options_pushdata, JSON.stringify({
			token,
			data: randomWords({exactly: 1, wordsPerString: 4}).join(' ') // je publie
		}))
			.then(res => {
				// une erreur se produit mais le client continue d'envoyer des données
				if (res.code)
					return console.log("erreur : ", res.message)

				switch (res.command) {
					case "log":
						console.log(res.data)
						break
					case "end":
						console.log("c'est la fin ! le serveur a demandé l'arrêt des envois")
						clearInterval(open_dialog)
						break
				}
			}), PUSHDATA_INTERVAL)

	})

