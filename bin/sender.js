require("dotenv").config()
const amqp = require("amqplib/callback_api")
const opt = {
	credentials: require("amqplib").credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASSWORD)
}
const IP = process.env.IP || "127.0.0.1"

amqp.connect(`amqp://${IP}`, opt, (error0, connection) => {
	if (error0) {
		throw error0
	}

	connection.createChannel((error1, channel) => {
		if (error1)
			throw error1

		let queue = "Q1",
			msg = "message spécifié"

		channel.assertQueue(queue, {
			durable: false
		})

		channel.sendToQueue(queue, Buffer.from(msg))
		console.log("envoyé : %s", msg)
	})

	setTimeout(() => {
		connection.close()
	}, 5000)

})
