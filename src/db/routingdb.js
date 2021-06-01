const queues = {
	0: "Interne",
	1: "externe_1",
	2: "externe_2"
}

exports.queues = Object.values(queues)

exports.get_queue = code => queues[code]

exports.destination_valid = code => Object.keys(queues).includes(code.toString())
