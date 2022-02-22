const vm = require("../vm")

module.exports = (script, fnName) => ({ types }) => {
	const fn = vm.run(`${script};module.exports = ${fnName}`)

	return {
		visitor: {
			CallExpression(path) {
				if (path.node.callee.name !== fnName) return
				if (path.node.arguments.length !== 2) return

				const [number, string] = path.node.arguments

				if (number.type !== "NumericLiteral") return
				if (string.type !== "StringLiteral") return

				const value = fn(number.value, string.value)
				path.replaceWith(types.StringLiteral(value))
			}
		}
	}
}
