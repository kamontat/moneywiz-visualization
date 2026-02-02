import path from 'node:path'

import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'

import svelteConfig from './svelte.config.js'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')
export default defineConfig([
	includeIgnoreFile(gitignorePath, 'global/gitignore'),
	js.configs.recommended,
	...ts.configs.recommended,
	importPlugin.flatConfigs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			// Downgrade to warnings for gradual migration of existing code
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			// Turn off unresolved imports to allow path exports defined in package.json
			'import/no-unresolved': 'off',
			'import/order': [
				'error',
				{
					groups: [
						'type',
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
						'object',
					],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
					sortTypesGroup: true,
					'newlines-between-types': 'never',
				},
			],
		},
	},
	{
		files: ['**/*.spec.ts'],
		rules: {
			// Allow using any in test files
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
		rules: {
			// Downgrade Svelte-specific rules to warnings for existing code
			'svelte/require-each-key': 'warn',
			'svelte/prefer-svelte-reactivity': 'warn',
			'svelte/no-navigation-without-resolve': 'warn',
		},
	},
])
