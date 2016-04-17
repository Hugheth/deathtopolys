module.exports = {
	"parserOptions": {
		"ecmaVersion": 6,
		"ecmaFeatures": {
			"jsx": true,
			"modules": true,
			"arrowFunctions": true,
			"classes": true
		}
	},
	"env": {
		"browser": true,
		"commonjs": true,
		"node": true
	},
	"globals": {
		"THREE": true,
		"$": true,
		"_": true,
		"Uint8Array": true,
		"Promise": true,
	},
	"extends": "eslint:recommended",
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"no-unused-vars": 1,
		"no-console": 0,
		"no-constant-condition": 0,
		"semi": [
			"error",
			"always"
		]
	}
};