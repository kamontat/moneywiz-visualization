import { describe, it, expect } from 'vitest'
import { filterFactory } from './index'
import { STORE_STATE_FLT_KEY } from '../constants'

describe('filterFactory', () => {
	describe('emptyState', () => {
		it('should have correct default values', () => {
			expect(filterFactory.emptyState).toEqual({
				type: STORE_STATE_FLT_KEY,
				data: undefined,
			})
		})
	})

	describe('normalize', () => {
		it('should preserve valid state', () => {
			const validState = {
				type: STORE_STATE_FLT_KEY,
				data: undefined,
			}
			expect(filterFactory.normalize(validState)).toEqual(validState)
		})

		it('should correct invalid structure', () => {
			const invalidState = {
				type: undefined,
				data: 'some-data',
			} as any

			// normalize keeps the data passed if available, but corrects key
			expect(filterFactory.normalize(invalidState)).toEqual({
				type: STORE_STATE_FLT_KEY,
				data: 'some-data',
			})
		})

		it('should handle undefined input', () => {
			expect(filterFactory.normalize(undefined)).toEqual({
				type: STORE_STATE_FLT_KEY,
				data: undefined,
			})
		})
	})
})
