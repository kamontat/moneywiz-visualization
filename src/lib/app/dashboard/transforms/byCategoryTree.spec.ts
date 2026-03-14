import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { byCategoryTree } from './byCategoryTree'

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

describe('byCategoryTree', () => {
	it('promotes subcategory to parent when parent category is blank', () => {
		const tree = byCategoryTree('Expense')([
			createExpense(-100, '', 'Uncategorized'),
		])

		expect(tree.parents).toHaveLength(1)
		expect(tree.parents[0].name).toBe('Uncategorized')
		expect(tree.parents[0].children[0].name).toBe('(uncategorized)')
	})
})
