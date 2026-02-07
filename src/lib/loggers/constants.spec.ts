import { describe, it, expect, vi } from 'vitest'

import * as constants from './constants'
import { Log } from './models'

// Mock debug library to inspect namespaces
vi.mock('debug', () => {
	const debugFn = vi.fn((namespace: string) => {
		const instance: any = vi.fn()
		instance.namespace = namespace
		instance.extend = vi.fn((suffix: string) => {
			return debugFn(`${namespace}:${suffix}`)
		})
		return instance
	})
	return { default: debugFn }
})

describe('Logger Constants', () => {
	it('should export defined loggers', () => {
		// Test that core library loggers are under 'moneywiz:libs:*'
		const libsLoggers = [
			'csv',
			'transaction',
			'analytic',
			'component',
			'formatter',
			'theme',
		]
		// Test utils loggers under 'moneywiz:utils:*'
		const utilsLoggers = ['db', 'store']
		// Test root-level loggers
		const rootLoggers = ['libs', 'utils', 'components', 'pages']

		libsLoggers.forEach((key) => {
			const logger = (constants as any)[key]
			expect(logger).toBeInstanceOf(Log)
			expect((logger as any)._log.namespace).toBe(`moneywiz:libs:${key}`)
		})

		utilsLoggers.forEach((key) => {
			const logger = (constants as any)[key]
			expect(logger).toBeInstanceOf(Log)
			expect((logger as any)._log.namespace).toBe(`moneywiz:utils:${key}`)
		})

		rootLoggers.forEach((key) => {
			const logger = (constants as any)[key]
			expect(logger).toBeInstanceOf(Log)
			expect((logger as any)._log.namespace).toBe(`moneywiz:${key}`)
		})
	})
})
