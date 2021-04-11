require("dotenv").config()
const amqp = require("amqplib/callback_api")
const opt = {
	credentials: require("amqplib").credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASSWORD)
}

amqp.connect("amqp://192.168.1.77", opt, (error0, connection) => {
	if (error0) {
		throw error0
	}

	connection.createChannel((error1, channel) => {
		if (error1)
			throw error1

		let queue = "Q1",
			msg = process.argv[2] ?? "aucun message spécifié"

		channel.assertQueue(queue, {
			durable: false
		})

		channel.sendToQueue(queue, Buffer.from(msg))
	})

	setTimeout(() => {
		connection.close()
	}, 5000)

})
