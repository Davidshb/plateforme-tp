require('dotenv').config()
const {check_destination} = require('../db/authdb')
const {get_queue, destination_valid} = require("../db/routingdb")
const {backend_queue} = require("../backend/main")
const {amqp_connect} = require("../common/functions")

function run() {
	amqp_connect()
		.then(channel => {
			return channel.assertQueue(backend_queue, {durable: true})
				.then(() => channel.consume(backend_queue, async msg => {
					const data = JSON.parse(msg.content.toString())

					if (!destination_valid(data.destination))
						return console.log("la destination %d n'est pas connu", data.destination)

					if ( !await check_destination(data.username, data.destination))
						return console.log("traffic illégal : %s %d -> %s", data.username, data.destination, data.data)

					const queue = get_queue(data.destination)

					return channel.assertQueue(queue)
						.then(() => channel.sendToQueue(queue, Buffer.from(JSON.stringify({
							username: data.username,
							data: data.data
						}))))
				}, {noAck: true}))
		})
}

exports.run = run
