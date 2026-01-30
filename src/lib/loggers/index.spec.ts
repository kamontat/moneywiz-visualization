import { describe, it, expect } from 'vitest'

import * as constants from './constants'

import * as loggers from './index'

describe('Logger Entrypoint', () => {
	it('should export everything from constants', () => {
		const loggerKeys = Object.keys(loggers)
		const constantKeys = Object.keys(constants)

		constantKeys.forEach((key) => {
			expect(loggerKeys).toContain(key)
			expect((loggers as any)[key]).toBe((constants as any)[key])
		})
	})
})
