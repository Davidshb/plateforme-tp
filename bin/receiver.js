require("dotenv").config()
const amqp = require("amqplib/callback_api")

const opt = {
	credentials: require("amqplib").credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASSWORD)
}

amqp.connect("amqp://192.168.1.77", opt, (error0, connection) => {
	if (error0) {
		console.log("error 0 : %s", error0.message)
		process.exit(-1)
	}


	connection.createChannel((error1, channel) => {
		if (error1) {
			console.log("error1 : %s", error1.message)
			process.exit(-2)
		}

		let queue = "Q1"

		channel.assertQueue(queue, {
			durable: false
		})

		channel.consume(queue, msg => console.log("queue %s : message -> %s", queue, msg.content.toString()))
	}, {
		noAck: true
	})
})
