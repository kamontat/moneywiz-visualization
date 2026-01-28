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
        const expected = [
            'csv',
            'transaction',
            'localStorage',
            'store',
            'component',
            'page'
        ]
        
        expected.forEach(key => {
            const logger = (constants as any)[key]
            expect(logger).toBeInstanceOf(Log)
            expect((logger as any)._log.namespace).toBe(`moneywiz:${key}`)
        })
    })
})
