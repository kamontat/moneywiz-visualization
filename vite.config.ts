import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],

	optimizeDeps: {
		include: ['chart.js/auto']
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
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}, {
				extends: true,
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			}, {
				extends: true,
				test: {
					name: 'e2e',
					testTimeout: 30000,
					hookTimeout: 60000,
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['e2e/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**']
				}
			}
		]
	}
});
