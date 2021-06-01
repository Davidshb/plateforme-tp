require('dotenv').config()
const {amqp_connect} = require("../common/functions")
const {queues} = require("../db/routingdb")

function run() {
	amqp_connect()
		.then(channel => {
			for (const queue of queues)
				channel.assertQueue(queue, {
					durable: true
				}).then(() => {
					console.log("en attente des messages dans %s", queue)
					channel.consume(queue, msg => {
						console.log("%s reçoit : %s", queue, msg.content.toString())
					}, {noAck: true})
				})
		})
}

exports.run = run
