import { describe, it, expect } from 'vitest'
import { parseAccount, parseCategory, parseTag } from './utils'

describe('transactions/utils', () => {
	describe('parseAccount', () => {
		it('should return empty object for now', () => {
			expect(parseAccount('some account')).toEqual({})
		})
	})

	describe('parseCategory', () => {
		it('should return empty object for now', () => {
			expect(parseCategory('some category')).toEqual({})
		})
	})

	describe('parseTag', () => {
		it('should return empty array for now', () => {
			expect(parseTag('some tag')).toEqual([])
		})
	})
})
