const fs = require("fs")
const babel = require("@babel/core")

const SCRIPT_FILENAME = "/srv/two/obfuscated.js"
const OBF_FNNAME = "a0_0x5089"

const script = fs.readFileSync(SCRIPT_FILENAME)

const phases = [
	{
		plugins: [
			require("babel-plugin-minify-constant-folding"),
			require("./babel-plugin/super-inliner.js")
		]
	},
	{
		plugins: [
			require("babel-plugin-minify-constant-folding"),
		]
	},
	{
		plugins: [
			require("./babel-plugin/super-caller.js")(script, OBF_FNNAME)
		]
	},
	{
		plugins: [
			require("babel-plugin-minify-constant-folding"),
		]
	},
	{
		plugins: [
			require("babel-plugin-transform-member-expression-literals"),
		]
	},
	{
		plugins: [
			require("./babel-plugin/super-inliner-lookup.js"),
		]
	},
	{
		plugins: [
			require("babel-plugin-minify-constant-folding"),
		]
	},
	{
		plugins: [
			require("./babel-plugin/super-inliner-anonymous.js"),
		]
	},
	{
		plugins: [
			require("babel-plugin-minify-constant-folding"),
			require("babel-plugin-minify-dead-code-elimination")
		]
	},
]

const code = phases.reduce((code, options) => {
	return babel.transformSync(code, options).code
}, script)

//console.log(code)

fs.writeFileSync("/srv/mdr.js", code)
process.exit(0)
