import { describe, it, expect } from 'vitest'
import { trxFactory } from './index'
import { STORE_STATE_TRX_KEY } from '../constants'

describe('trxFactory', () => {
	describe('emptyState', () => {
		it('should have correct default values', () => {
			expect(trxFactory.emptyState).toEqual({
				type: STORE_STATE_TRX_KEY,
				fileName: null,
				data: [],
			})
		})
	})

	describe('normalize', () => {
		it('should preserve valid state', () => {
			const validState = {
				type: STORE_STATE_TRX_KEY,
				fileName: 'test.csv',
				data: [{ id: '1' }] as any,
			}
			expect(trxFactory.normalize(validState)).toEqual(validState)
		})

		it('should correct invalid structure', () => {
			const invalidState = {
				type: undefined,
				fileName: undefined,
				data: null,
			} as any

			expect(trxFactory.normalize(invalidState)).toEqual({
				type: STORE_STATE_TRX_KEY,
				fileName: null,
				data: [],
			})
		})

		it('should handle undefined input', () => {
			expect(trxFactory.normalize(undefined)).toEqual({
				type: STORE_STATE_TRX_KEY,
				fileName: null,
				data: [],
			})
		})
	})
})
