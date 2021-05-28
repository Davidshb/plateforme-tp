const axios = require('axios')
const {ArgumentParser} = require('argparse')

// Setting default value
let url = "http://localhost:8000"

// If some parameters are there, use them...
const parser = ArgumentParser({
	add_help: true
})

parser.add_argument("-l", "--login", {help: "authentication username"})
parser.add_argument("-p", "--password", {help: "authentication password"})
parser.add_argument("-t", "--to", {help: "code destinataire", type: "int", required: true, choices: [0, 1, 2]})

let args = parser.parse_args()

if (args.error)
	console.log(args)


const login = args.login || "test"
const password = args.password || "pass"
const code = args.to

axios.post(`${url}/login`, {
		login,
		password
	}
).then(d => {
	let token = d.data.token
	return axios.post(`${url}/pushdata`, {
		token,
		code,
		data: "ceci est une donnée"
	})
}).then(d => {
	console.log(d.data)
}).catch(error => {
	console.log("ERROR : ", error.message)
	console.log(error.response.data)
})


