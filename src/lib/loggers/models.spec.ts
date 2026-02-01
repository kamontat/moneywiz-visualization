import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Log } from './models'

// Mock deubg library
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

describe('Log', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('root', () => {
		it('should have correct namespace', () => {
			// Access private property or verify through behavior
			// Since we mocked createDebug, we can verify it was called with 'moneywiz'
			// However, Log.root is static and initialized on import, so expected calls might happen early.
			// Because vi.mock is hoisted, createDebug should catch it.
			// But verifying 'moneywiz' call specifically for root might be tricky if other tests ran first or it's checking call counts.
			// We can assume it's "moneywiz" if we extend it and check the result.

			const rootFn = (Log.root as any)._log
			expect(rootFn.namespace).toBe('moneywiz')
		})
	})

	describe('extends', () => {
		it('should create sub-logger with correct namespace', () => {
			const sub = Log.root.extends('test')
			// The internal _log should have namespace 'moneywiz:test'
			const internalLog = (sub as any)._log
			expect(internalLog.namespace).toBe('moneywiz:test')
		})

		it('should nest namespaces correctly', () => {
			const sub = Log.root.extends('a', 'b')
			const internalLog = (sub as any)._log
			expect(internalLog.namespace).toBe('moneywiz:a:b')

			const sub2 = sub.extends('c')
			const internalLog2 = (sub2 as any)._log
			expect(internalLog2.namespace).toBe('moneywiz:a:b:c')
		})
	})

	describe('logging methods', () => {
		let logger: Log<any, any>

		beforeEach(() => {
			logger = Log.root.extends('unit-test')
			// Spy on the internal debug instances
			// Because of our mock, (logger as any)._log is a spy
		})

		it('log() calls the main debugger', () => {
			const internalLog = (logger as any)._log
			logger.log('message %s', 'param')
			expect(internalLog).toHaveBeenCalledWith('message %s', 'param')
		})

		it('debug() calls the debug extension', () => {
			const internalDebug = (logger as any)._debug
			logger.debug('debug msg')
			expect(internalDebug).toHaveBeenCalledWith('debug msg')
			expect(internalDebug.namespace).toBe('moneywiz:unit-test:debug')
		})

		it('info() calls the info extension', () => {
			const internalInfo = (logger as any)._info
			logger.info('info msg')
			expect(internalInfo).toHaveBeenCalledWith('info msg')
			expect(internalInfo.namespace).toBe('moneywiz:unit-test:info')
		})

		it('warn() calls the warn extension', () => {
			const internalWarn = (logger as any)._warn
			logger.warn('warn msg')
			expect(internalWarn).toHaveBeenCalledWith('warn msg')
			expect(internalWarn.namespace).toBe('moneywiz:unit-test:warn')
		})

		it('error() calls the error extension', () => {
			const internalError = (logger as any)._error
			logger.error('error msg')
			expect(internalError).toHaveBeenCalledWith('error msg')
			expect(internalError.namespace).toBe('moneywiz:unit-test:error')
		})
	})

	describe('lazy initialization fallback', () => {
		// The class has getDebug(), getInfo(), etc that check if property exists.
		// Although constructor initializes them, we can try to delete them to test lazy load if we really want 100% coverage.

		it('should re-initialize debug if missing', () => {
			const logger = Log.root.extends('lazy')
			const anyLogger = logger as any

			// clear it
			anyLogger._debug = undefined
			// Should be recreated
			anyLogger.debug('test')
			expect(anyLogger._debug).toBeDefined()
			expect(anyLogger._debug.namespace).toBe('moneywiz:lazy:debug')
		})

		it('should re-initialize info if missing', () => {
			const logger = Log.root.extends('lazy')
			const anyLogger = logger as any
			anyLogger._info = undefined
			anyLogger.info('test')
			expect(anyLogger._info).toBeDefined()
			expect(anyLogger._info.namespace).toBe('moneywiz:lazy:info')
		})

		it('should re-initialize warn if missing', () => {
			const logger = Log.root.extends('lazy')
			const anyLogger = logger as any
			anyLogger._warn = undefined
			anyLogger.warn('test')
			expect(anyLogger._warn).toBeDefined()
			expect(anyLogger._warn.namespace).toBe('moneywiz:lazy:warn')
		})

		it('should re-initialize error if missing', () => {
			const logger = Log.root.extends('lazy')
			const anyLogger = logger as any
			anyLogger._error = undefined
			anyLogger.error('test')
			expect(anyLogger._error).toBeDefined()
			expect(anyLogger._error.namespace).toBe('moneywiz:lazy:error')
		})
	})
})
