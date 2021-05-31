const {queues} = require("../db/routingdb")

function display_all(amqp_open) {
	for (const queue of queues)
		amqp_open
			.then(conn => conn.createChannel())
			.then(channel => {
				return channel.assertQueue(queue).then(() => {
					channel.consume(queue, msg => {
						const data = JSON.parse(msg.content.toString())
						channel.ack(msg)
						console.log("-------------------------------------")
						console.log("queue %s : %s %s", queue, data.username, data.data)
						console.log("-------------------------------------")
					})
				})
			})
}

exports.display_all = display_all
