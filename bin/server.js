const fichier_ignorer = [
	"client"
]

const fs = require("fs")
const path = require("path")

function load(path_p) {
	fs.lstat(path_p, function (err, stat) {
		if (stat.isDirectory())
			fs.readdir(path_p, function (err, files) {
				for (const file of files)
					load(path.join(path_p, file))
			})
		else {
			if (!path_p.endsWith(".js") || path_p.endsWith(__filename) || new RegExp(fichier_ignorer.join("|")).test(path_p))
				return
			require(path_p)
		}
	})
}

load(__dirname)

