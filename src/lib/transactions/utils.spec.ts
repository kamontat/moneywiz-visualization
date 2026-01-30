import type { ParsedAccountType } from './models'
import { describe, it, expect } from 'vitest'

import {
	parseAccount,
	parseAccountType,
	parseAmount,
	parseCategory,
	parseDate,
	parseTag,
} from './utils'

describe('transactions/utils', () => {
	describe('parseAccountType', () => {
		const cases: [string, ParsedAccountType][] = [
			['A', 'Checking'],
			['C', 'CreditCard'],
			['D', 'DebitCard'],
			['I', 'Investment'],
			['L', 'Loan'],
			['W', 'Wallet'],
			['OW', 'OnlineWallet'],
			['CT', 'Cryptocurrency'],
			['X', 'Unknown'],
			['', 'Unknown'],
		]

		it.each(cases)('should parse %s to %s', (input, expected) => {
			expect(parseAccountType(input)).toBe(expected)
		})
	})

	describe('parseAccount', () => {
		it('should parse simple account with type', () => {
			expect(parseAccount('Cash (W)')).toEqual({
				name: 'Cash',
				extra: null,
				type: 'Wallet',
			})
		})

		it('should parse account with extra info and type', () => {
			expect(parseAccount('Bank [1234] (A)')).toEqual({
				name: 'Bank',
				extra: '1234',
				type: 'Checking',
			})
		})

		it('should parse account without type as Unknown', () => {
			// If input doesn't match format, it treats everything as name
			expect(parseAccount('Just Name')).toEqual({
				name: 'Just Name',
				extra: null,
				type: 'Unknown',
			})
		})

		it('should parse account with extra but no type', () => {
			// Currently implementation expects type at the end.
			// If format is strictly Name [Extra] (Type), then missing type fails regex.
			// Let's see implementation.
			// typeRegex matches (...) at end.
			// If not found, name is full text.
			// extraRegex checks [...] at end of name.
			// So "Name [123]" with no type -> type=Unknown, name matches extra -> extra=123, name=Name.
			expect(parseAccount('Bank [1234]')).toEqual({
				name: 'Bank',
				extra: '1234',
				type: 'Unknown',
			})
		})
	})

	describe('parseAmount', () => {
		it('should parse simple integer', () => {
			expect(parseAmount('100', null)).toEqual({ value: 100, currency: 'THB' })
		})

		it('should parse float', () => {
			expect(parseAmount('100.50', undefined)).toEqual({ value: 100.5, currency: 'THB' })
		})

		it('should parse negative number', () => {
			expect(parseAmount('-100', undefined)).toEqual({ value: -100, currency: 'THB' })
		})

		it('should ignore commas', () => {
			expect(parseAmount('1,234,567.89', '')).toEqual({
				value: 1234567.89,
				currency: 'THB',
			})
		})

		it('should handle custom currency', () => {
			expect(parseAmount('100', 'USD')).toEqual({ value: 100, currency: 'USD' })
		})

		it('should return 0 for invalid input', () => {
			expect(parseAmount('abc', '')).toEqual({ value: 0, currency: 'THB' })
		})
	})

	describe('parseCategory', () => {
		it('should parse category and subcategory', () => {
			expect(parseCategory('Food > Lunch')).toEqual({
				category: 'Food',
				subcategory: 'Lunch',
			})
		})

		it('should parse simple category', () => {
			expect(parseCategory('Salary')).toEqual({
				category: 'Salary',
				subcategory: '',
			})
		})

		it('should handle extra spaces', () => {
			expect(parseCategory(' Food  >  Lunch ')).toEqual({
				category: 'Food',
				subcategory: 'Lunch',
			})
		})
	})

	describe('parseTag', () => {
		it('should parse single tag with group', () => {
			expect(parseTag('Priority: High')).toEqual([{ category: 'Priority', name: 'High' }])
		})

		it('should parse single tag without group', () => {
			expect(parseTag('Simple')).toEqual([{ category: '', name: 'Simple' }])
		})

		it('should parse multiple tags', () => {
			expect(parseTag('Priority: High; Status: Todo; Simple')).toEqual([
				{ category: 'Priority', name: 'High' },
				{ category: 'Status', name: 'Todo' },
				{ category: '', name: 'Simple' },
			])
		})

		it('should convert Zvent category to Event', () => {
			expect(parseTag('Zvent: Anniversary')).toEqual([{ category: 'Event', name: 'Anniversary' }])
		})

		it('should handle empty input', () => {
			expect(parseTag('')).toEqual([])
		})
	})

	describe('parseDate', () => {
		it('should parse date with time', () => {
			expect(parseDate('31/12/2023', '23:59')).toEqual(new Date(2023, 11, 31, 23, 59))
		})

		it('should parse date without time', () => {
			expect(parseDate('01/01/2023', undefined)).toEqual(new Date(2023, 0, 1, 0, 0))
		})

		it('should parse date with empty time', () => {
			expect(parseDate('01/01/2023', '')).toEqual(new Date(2023, 0, 1, 0, 0))
		})

		it('should return epoch for empty input', () => {
			expect(parseDate('', undefined)).toEqual(new Date(0))
		})

		it('should handle invalid number format gracefully', () => {
			const result = parseDate('XX/XX/XXXX', 'XX:XX')
			expect(result.toString()).toBe('Invalid Date')
		})
	})
})
