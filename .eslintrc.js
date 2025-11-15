module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
		'n8n-nodes-base',
	],
	extends: [
		'eslint:recommended',
		'plugin:n8n-nodes-base/community',
	],
	rules: {
		// Allow TypeScript 'this' parameter typing
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['error', {
			argsIgnorePattern: '^_',
			varsIgnorePattern: '^_',
			args: 'after-used',
			ignoreRestSiblings: true,
		}],
	},
};

