module.exports = {
	"parserOptions": {
		"ecmaVersion": 6,
		"ecmaFeatures": {
			"jsx": true
		}
	},
	"env": {
		"browser": true,
		"commonjs": true,
		"node": true
	},
	"globals": {
		"THREE": true
	},
	"extends": "eslint:recommended",
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"no-console": 0,
		"linebreak-style": [
			"error",
			"windows"
		],
		"semi": [
			"error",
			"always"
		]
	}
};