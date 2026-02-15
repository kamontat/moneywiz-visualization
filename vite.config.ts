import type { Plugin } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { playwright } from '@vitest/browser-playwright'
import devtoolsJson from 'vite-plugin-devtools-json'
import { defineConfig } from 'vitest/config'

const headers = new Headers({
	'Cross-Origin-Embedder-Policy': 'require-corp',
	'Cross-Origin-Opener-Policy': 'same-origin',
})

const crossOriginIsolation = async (): Promise<Plugin> => {
	return {
		name: 'cross-origin-isolation',
		configureServer(server) {
			server.middlewares.use((_, res, next) => {
				res.setHeaders(headers)
				next()
			})
		},
		configurePreviewServer(server) {
			server.middlewares.use((_, res, next) => {
				res.setHeaders(headers)
				next()
			})
		},
	}
}

export default defineConfig({
	plugins: [crossOriginIsolation(), tailwindcss(), sveltekit(), devtoolsJson()],
	worker: {
		// https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker#browser_compatibility
		format: 'es',
	},
	preview: {
		strictPort: true,
		port: 4173,
	},
	server: {
		strictPort: true,
		port: 5173,
	},
	optimizeDeps: {
		exclude: ['@sqlite.org/sqlite-wasm'],
		include: ['chart.js/auto'],
	},

	test: {
		exclude: ['node_modules/**'],
		expect: { requireAssertions: true },

		projects: [
			{
				extends: true,
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
			{
				extends: true,
				test: {
					name: 'client',
					setupFiles: ['vitest-browser-svelte'],
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }],
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
				},
			},
		],
	},
})
