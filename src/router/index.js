const {check_code} = require('../db/authdb')
const {get_queue, code_valid} = require("../db/routingdb")

function routeur(amqp_open, backend_queue) {
	amqp_open.then(conn => conn.createChannel())
		.then(channel => {
			return channel.assertQueue(backend_queue, {durable: true})
				.then(() => channel.consume(backend_queue, msg => {
					const data = JSON.parse(msg.content.toString())

					if (!code_valid(data.code))
						return console.log("le code %d n'est pas connu", data.code)

					if(!check_code(data.username, data.code))
						return console.log("traffic illégal : %s %d -> %s", data.username, data.code, data.data)

					channel.ack(msg)

					const queue = get_queue(data.code)

					return channel.assertQueue(queue)
						.then(() => channel.sendToQueue(queue, Buffer.from(JSON.stringify({
							username: data.username,
							data: data.data
						}))))
				}))
		})
}

exports.routeur = routeur
