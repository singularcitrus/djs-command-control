module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es2021": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 12
	},
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"arrow-body-style": [
			"error",
			"as-needed"
		],
		"arrow-parens": [
			"error",
			"always"
		],
		"object-curly-spacing": [
			"warn",
			"always"
		],
	},
	"globals": {
		"__dirname": true,
		"process": true,
	},
};
