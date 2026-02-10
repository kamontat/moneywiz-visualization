import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { byCategoryTotal } from './byCategoryTotal'

const createExpense = (
	amount: number,
	category: string,
	subcategory: string
): ParsedTransaction => ({
	account: { type: 'Checking', name: 'Cash', extra: null },
	description: 'Expense transaction',
	amount: { value: amount, currency: 'THB' },
	date: new Date('2026-01-01T00:00:00.000Z'),
	memo: '',
	tags: [],
	raw: {},
	type: 'Expense',
	payee: 'Store',
	category: { category, subcategory },
	checkNumber: '',
})

describe('byCategoryTotal', () => {
	it('promotes subcategory to parent when parent category is blank', () => {
		const totals = byCategoryTotal([createExpense(-100, '', 'Uncategorized')])

		expect(totals.Expense.parents).toHaveProperty('Uncategorized')
		expect(totals.Expense.parents.Uncategorized.children).toHaveProperty('')
		expect(Object.keys(totals.Expense.parents)).not.toContain('')
	})
})
