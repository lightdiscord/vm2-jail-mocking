const { NodeVM } = require("vm2")
const fs = require("fs")

const createProxy = (name, fns) => new Proxy(() => {
	console.log("ignored")
}, {
	get(target, prop, receiver) {
		console.log(`[${name}] get`, prop)

		if (fns) {
			if (fns[prop]) {
				return function() {
					console.log(`[${name}] calling`, prop)
					return fns[prop](...arguments)
				}
			}
			return function() {
				console.log(`[${name}] calling`, prop)
				return fns(...arguments)
			}
		}
	},

	apply() {
		console.log("ptdrlol")

	}
})

const vm = new NodeVM({
	console: "inherit",
	sandbox: {},
	require: {
		mock: {
			fs: createProxy("fs", {
				writeFileSync(file, data) {
					if (!["/\\temp.ps1"].includes(file)) {
						console.log(file, data)
					}
					return data.length
				},
				unlinkSync(path) {
					console.log(path)
				},
				readdirSync(path) {
					console.log("readdirSync", path)
					return []
				},
				existsSync(path) {
					console.log(path)
					return false
				}
			}),
			glob: () => {
				console.log("glob??")

			},
			crypto: createProxy("crypto"),
			child_process: createProxy("child_process", {
				execSync(command, options) {
					console.log(command)
				},

				exec(command, options, callback) {
					console.log(command, callback)
				}
			}),
			axios: createProxy("axios", {
				async request(config) {
					console.log("axios request", config)	
				},

				async get(url) {
					console.log(url)
					return {
						data: {
							"ip": "0000:0000:000:0000:0000:0000:0000:0000",
							"ip_decimal": 00000000000000000000000000000000000000,
							"country": "France",
							"country_iso": "FR",
							"country_eu": true,
							"region_name": "Region",
							"region_code": "REG",
							"zip_code": "00000",
							"city": "City",
							"latitude": 0,
							"longitude": 0,
							"time_zone": "Europe/Paris",
							"asn": "AS0000",
							"asn_org": "Asn",
							"user_agent": {
								"product": "Mozilla",
								"version": "5.0",
								"comment": "(X11; Linux x86_64; rv:96.0) Gecko/20100101 Firefox/96.0",
								"raw_value": "Mozilla/5.0 (X11; Linux x86_64; rv:96.0) Gecko/20100101 Firefox/96.0"
							}
						}
					}
				},

				async post(url, data) {
					console.log(url, data)

					return {}
				}
			}),
			'buffer-replace': (a, b, c) => {
				console.log("buffer-replace", a, b, c)
				return a
			},
			'nexe-natives': createProxy("nexe-natives", () => "mdr"),
			"resolve": (module) => {
				console.log("resolving", module)

				return () => {
					console.log("wtf")
				}
			}
		}
	}
})

const script = fs.readFileSync("/root/a.js")

process.on('uncaughtException', (err) => {
	console.log("uncaught", err);
})

vm.run(script.toString())

