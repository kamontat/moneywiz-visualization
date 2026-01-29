import { describe, it, expect } from 'vitest'
import { csvFactory } from './index'
import { STORE_STATE_CSV_KEY } from '../constants'

describe('csvFactory', () => {
	describe('emptyState', () => {
		it('should have correct default values', () => {
			expect(csvFactory.emptyState).toEqual({
				type: STORE_STATE_CSV_KEY,
				fileName: null,
				data: { headers: [], rows: [] },
			})
		})
	})

	describe('normalize', () => {
		it('should preserve valid state', () => {
			const validState = {
				type: STORE_STATE_CSV_KEY,
				fileName: 'test.csv',
				data: {
					headers: ['col1'],
					rows: [['val1']],
				},
			}
			expect(csvFactory.normalize(validState)).toEqual(validState)
		})

		it('should correct invalid structure', () => {
			const invalidState = {
				type: undefined,
				fileName: undefined,
				data: null,
			} as any

			expect(csvFactory.normalize(invalidState)).toEqual({
				type: STORE_STATE_CSV_KEY,
				fileName: null,
				data: { headers: [], rows: [] },
			})
		})

		it('should correct invalid data structure', () => {
			const invalidDataState = {
				type: STORE_STATE_CSV_KEY,
				fileName: 'test.csv',
				data: {
					headers: null,
					rows: 'not-an-array',
				},
			} as any

			expect(csvFactory.normalize(invalidDataState)).toEqual({
				type: STORE_STATE_CSV_KEY,
				fileName: 'test.csv',
				data: { headers: [], rows: [] },
			})
		})

		it('should handle undefined input', () => {
			expect(csvFactory.normalize(undefined)).toEqual({
				type: STORE_STATE_CSV_KEY,
				fileName: null,
				data: { headers: [], rows: [] },
			})
		})
	})
})
