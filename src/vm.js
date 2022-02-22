const { NodeVM } = require("vm2")

const createProxy = (name, fns) => new Proxy(() => {}, {
	get(target, prop, receiver) {
		if (fns && fns[prop]) {
			return fns[prop]
		}

		console.log(`[${name}] missed get`, prop)

		return createProxy(`${name}.${prop}.missed`)
	},

	apply(target, that, args) {
		console.log(`[${name}]`, args)

		return createProxy(`${name}.apply`)
	}
})

const FAKE_APP_DATA = "C:\\users\\me\\AppData"

module.exports = new NodeVM({
	console: "inherit",
	sandbox: { },
	require: {
		mock: {
			'os': createProxy("os"),
			'form-data': createProxy("form-data"),
			'zip-local': createProxy("zip-local"),
			'path': createProxy("path"),
			'sqlite3': createProxy("sqlite3"),
			'win-dpapi': createProxy("win-dpapi"),
			'nexe-natives': createProxy("nexe-natives"),
			'glob': createProxy("glob"),
			'crypto': createProxy("crypto"),

			https: createProxy("https", {
				get(url) {
					return createProxy("https.get", {
						on(event, callback) {
							if (event === "error") callback("On error execution")
						}
					})
				}
			}),

			fs: createProxy("fs", {
				readdirSync(path) {
					console.log("[fs.readdirSync]", path)
					return []
				},

				writeFileSync(path, content) {
					console.log("[fs.writeFileSync]", path, content)
					return content.length
				},

				readFileSync(path) {
					if (path === `${FAKE_APP_DATA}\\BetterDiscord\\data\\betterdiscord.asar`) {
						return "Hello, world!"
					}
				},

				existsSync(path) {
					console.log("[fs.existsSync]", path)

					const exists = [
						`${FAKE_APP_DATA}\\BetterDiscord\\data\\betterdiscord.asar`
					]

					return exists.includes(path)
				}
			}),

			axios: createProxy("axios", {
				async request(config) {
					console.log("[axios request]", config.url)	
					return { data: {} }
				},

				async get(url) {
					console.log("[axios get]", url)
					return { data: {} }
				},

				async post(url, data) {
					console.log("[axios post]", url, data)
					return { data: {} }
				}
			}),

			'child_process': createProxy("child_process", {
				exec(command, callback) {
					console.log("[exec]", command)
					return callback(null, "")
				}
			}),

			'buffer-replace': (a, b, c) => {
				console.log("buffer-replace", a, b, c)
				return a
			},
		}
	},
	env: createProxy("env", {
		APPDATA: FAKE_APP_DATA,
		LOCALAPPDATA: FAKE_APP_DATA,
		appdata: FAKE_APP_DATA,
		localappdata: FAKE_APP_DATA
	})
})
