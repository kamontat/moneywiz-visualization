import type { ParsedBaseTransaction, ParsedCategory } from '$lib/ledger/models'
import { describe, expect, it } from 'vitest'

import { classifyDebtCategory } from './debt'

const baseTransaction = (): ParsedBaseTransaction => ({
	account: { type: 'Checking', name: 'Main', extra: null },
	amount: { value: -100, currency: 'THB' },
	date: new Date('2026-01-01T00:00:00.000Z'),
	description: 'test',
	memo: '',
	tags: [],
	raw: {},
})

describe('classifyDebtCategory', () => {
	it('maps debt category to Debt', () => {
		const category: ParsedCategory = {
			category: 'Other Expenses',
			subcategory: 'Debt',
		}
		const result = classifyDebtCategory(baseTransaction(), 'Bank', category)

		expect(result?.type).toBe('Debt')
	})

	it('maps debt repayment category to DebtRepayment', () => {
		const category: ParsedCategory = {
			category: 'Other Incomes',
			subcategory: 'Debt Repayment',
		}
		const result = classifyDebtCategory(baseTransaction(), 'Bank', category)

		expect(result?.type).toBe('DebtRepayment')
	})

	it('maps windfall category to Windfall', () => {
		const category: ParsedCategory = {
			category: 'Other Incomes',
			subcategory: 'Windfall',
		}
		const result = classifyDebtCategory(baseTransaction(), 'Lottery', category)

		expect(result?.type).toBe('Windfall')
	})

	it('maps giveaway category to Giveaway', () => {
		const category: ParsedCategory = {
			category: 'Other Expenses',
			subcategory: 'Giveaways',
		}
		const result = classifyDebtCategory(baseTransaction(), 'Gift', category)

		expect(result?.type).toBe('Giveaway')
	})

	it('returns undefined for non-special category', () => {
		const category: ParsedCategory = {
			category: 'Food',
			subcategory: 'Restaurant',
		}
		const result = classifyDebtCategory(baseTransaction(), 'Cafe', category)

		expect(result).toBeUndefined()
	})
})
