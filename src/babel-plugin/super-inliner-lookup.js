const usageVisitor = {
	MemberExpression(path) {
		if (path.node.object.type !== "Identifier") return
		if (path.node.object.name !== this.name) return

		for (const property of this.properties) {
			if (property.type === "ObjectProperty") {
				if (property.key.value === path.node.property.name) {
					path.replaceWith(this.types.ParenthesizedExpression(this.types.cloneDeep(property.value)))
					return
				}
			}
		}
	}
}

const visit = (types) => (path) => {
	const { node } = path

	if (node.body.type !== "BlockStatement") return
	if (node.body.body.length === 0) return;

	const [first] = node.body.body

	if (first.type === "VariableDeclaration") {
		const [declaration] = first.declarations
		const { name } = declaration.id
		const { type, properties } = declaration.init

		if (type === "ObjectExpression") {
			path.traverse(usageVisitor, { name, properties, types })

			if (first.declarations.length === 1) {
				node.body.body.shift()
			} else if (first.declarations.length > 1) {
				first.declarations.shift()
			}
		}
	}
} 

module.exports = ({ types }) => ({
	visitor: {
		FunctionDeclaration: visit(types),
		FunctionExpression: visit(types),
		ArrowFunctionExpression: visit(types),
	}
})
