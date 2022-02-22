// Inspired by https://github.com/chocolateboy/babel-plugin-inline-functions but more aggressive.

const argumentsInliningVisitor = {
    Identifier (path) {
        for (let i = 0; i < this.params.length; i++) {
            if (path.node.name === this.params[i].name) {
                if (this.args[i]) {
                    path.replaceWith(this.args[i])
                    path.skip()
                } else {
                    path.replaceWithSourceString('undefined')
                }
            }
        }
    }
}

const inlineFunctionVisitor = {
    CallExpression (path) {
        if (path.node.callee.name === this.name) {
            const { params } = this
            const args = path.node.arguments
            const returnStatement = this.types.cloneDeep(this.returnStatement)

            path.replaceWith(returnStatement)
            path.traverse(argumentsInliningVisitor, { args, params })
            path.replaceWith(returnStatement.argument)
        }
    }
}

module.exports = ({ types }) => ({
	visitor: {
		FunctionDeclaration (path) {
			const { node } = path

			if (node.body.body.length !== 1) {
				return
			}

			const [returnStatement] = node.body.body
			const { name } = node.id

			path.parentPath.traverse(inlineFunctionVisitor, {
				name,
				params: node.params,
				returnStatement,
				types,
			})

			path.remove()
		}
	}
})
