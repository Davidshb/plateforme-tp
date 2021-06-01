const axios = require('axios')
const {ArgumentParser} = require('argparse')
const URL = "http://localhost:8000"
const faker = require("faker/locale/fr")

function run() {
	const parser = new ArgumentParser({
		description: 'Client parameters'
	})

	parser.add_argument('-l', '--login', {help: 'Login to use', required: true})
	parser.add_argument('-p', '--password', {help: 'Password', required: true})
	//parser.add_argument('-t', '--to', {help: 'Destination', type: "int", required: true, choices: [0, 1, 2]})

	let args = parser.parse_args()

	if (args.error)
		console.log(args)

	let username = args.login
	let password = args.password

	axios
		.post(`${URL}/login`, {
			login: username,
			password
		})
		.then(d => {
			for (let i = 0; i < faker.datatype.number({min: 1, max: 10}); i++)
				axios.post(`${URL}/pushdata`, {
					token: d.data.token,
					data: {ville: faker.address.cityName(), temperature: faker.datatype.number({min: 0, max: 30, precision: .1})},
					destination: 0
				})
					.then(res => console.log(res.data))
					.catch(error => console.log("PUSHDATA ERROR", error.message, error.response.data))
		}).catch(error => console.log("LOGIN ERROR ", error.message, error.response.data))
}

exports.run = run
