const {redis_set} = require("../common/functions")
const {get_queue} = require("../db/routingdb")
const {amqp_connect} = require("../common/functions")

function run() {
	const queue = get_queue(0)

	amqp_connect()
		.then(channel => {
			channel.assertQueue(queue, {
				durable: true
			})
			console.log("j'attends les messages de la queue %s pour les mettre sur redis", queue)
			channel.consume(queue, msg => {
				const data = JSON.parse(msg.content.toString())
				console.log("%s -> %f", data.data.ville, data.data.temperature)
				redis_set(data.data.ville.toLowerCase(), data.data.temperature.toString())
			}, {noAck: true})
		})
}

exports.run = run
