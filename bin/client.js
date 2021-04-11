const http = require('http')

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
	hostname: 'localhost',
	port: 5000,
	path: '/pushdata',
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
}


const my_request = (_options, _data) => {
	_options.headers["Content-Length"] = _data.length

	return new Promise((resolve, reject) => {
		const req = http.request(_options, res => {
			console.log(`statusCode: ${res.statusCode}`)
			let chunks = []

			res.on('data', d => {
				chunks.push(d)
			})

			res.on('end', () => {
				resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")))
			})
		})

		req.on('error', error => {
			reject(error)
		})

		req.write(_data)
		req.end()
	})
}

my_request(options_login, data_login).then(res => {
	return my_request(options_pushdata, JSON.stringify({
		token: res.token,
		data: "tkt mgl"
	}))
})
	.then(res => console.log(res))


