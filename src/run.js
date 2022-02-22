const fs = require("fs")
const vm = require("./vm")

const script = fs.readFileSync("/srv/two/obfuscated.js")

process.on('uncaughtException', (err) => {
	console.error(err);
})

vm.run(script.toString())
