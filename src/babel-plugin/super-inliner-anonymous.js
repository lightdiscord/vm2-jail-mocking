module.exports = ({ types }) => ({
	visitor: {
		CallExpression(path) {
			const { node } = path
			const { callee } = node

			if (callee.type !== "FunctionExpression") return;
			if (callee.body.body.length !== 1) return;

			const [returnStatement] = callee.body.body

			if (returnStatement.type !== "ReturnStatement") return

			const args = node.arguments
			const clone = types.cloneDeep(returnStatement)

			path.replaceWith(clone)
			path.traverse({
				Identifier(path) {
					for (let i = 0; i < callee.params.length; i++) {
						if (path.node.name === callee.params[i].name) {
							if (args[i]) {
								path.replaceWith(args[i])
								path.skip()
							} else {
								path.replaceWithSourceString('undefined')
							}
						}
					}
				}
			})
			path.replaceWith(clone.argument)
		}
	}
})
