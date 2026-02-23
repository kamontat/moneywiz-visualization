import type {
	ParsedBaseTransaction,
	ParsedCategory,
} from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { classifyIncomeExpenseFallback } from './income-expense'

const baseTransaction = (): ParsedBaseTransaction => ({
	account: { type: 'Checking', name: 'Main', extra: null },
	amount: { value: -100, currency: 'THB' },
	date: new Date('2026-01-01T00:00:00.000Z'),
	description: 'test',
	memo: '',
	tags: [],
	raw: {},
})

describe('classifyIncomeExpenseFallback', () => {
	it('returns Income when amount is positive and category is income', () => {
		const category: ParsedCategory = {
			category: 'Other Incomes',
			subcategory: 'Salary',
		}
		const result = classifyIncomeExpenseFallback(baseTransaction(), {
			amount: 100,
			category,
			hasCategory: true,
			payee: 'Employer',
		})

		expect(result.type).toBe('Income')
	})

	it('returns Expense when amount is negative', () => {
		const category: ParsedCategory = {
			category: 'Food',
			subcategory: 'Restaurant',
		}
		const result = classifyIncomeExpenseFallback(baseTransaction(), {
			amount: -50,
			category,
			hasCategory: true,
			payee: 'Cafe',
		})

		expect(result.type).toBe('Expense')
	})

	it('returns Unknown when no category is present', () => {
		const category: ParsedCategory = { category: '', subcategory: '' }
		const result = classifyIncomeExpenseFallback(baseTransaction(), {
			amount: 0,
			category,
			hasCategory: false,
			payee: '',
		})

		expect(result.type).toBe('Unknown')
	})

	it('returns Refund when category exists but is not income and amount is zero', () => {
		const category: ParsedCategory = { category: 'Shopping', subcategory: '' }
		const result = classifyIncomeExpenseFallback(baseTransaction(), {
			amount: 0,
			category,
			hasCategory: true,
			payee: 'Store',
		})

		expect(result.type).toBe('Refund')
	})
})
