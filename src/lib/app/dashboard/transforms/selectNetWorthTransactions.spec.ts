import type { FilterState } from '$lib/app/filters/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { selectNetWorthTransactions } from './selectNetWorthTransactions'

import { emptyFilterState } from '$lib/app/filters/models'

const createIncome = (date: string, account: string): ParsedTransaction => ({
	type: 'Income',
	account: { type: 'Checking', name: account, extra: null },
	description: '',
	amount: { value: 100, currency: 'THB' },
	date: new Date(date),
	memo: '',
	payee: 'Employer',
	category: { category: 'Compensation', subcategory: 'Salary' },
	checkNumber: '',
	tags: [{ category: 'Group', name: 'A' }],
	raw: {},
})

const createState = (overrides: Partial<FilterState>): FilterState => ({
	...emptyFilterState(),
	...overrides,
})

describe('selectNetWorthTransactions', () => {
	it('filters by date range and account only', () => {
		const transactions = [
			createIncome('2025-01-01', 'Main'),
			createIncome('2025-02-01', 'Main'),
			createIncome('2025-02-01', 'Savings'),
		]
		const state = createState({
			dateRange: {
				start: new Date('2025-02-01'),
				end: new Date('2025-02-28'),
			},
			accounts: ['Main'],
		})

		const selected = selectNetWorthTransactions(transactions, state)

		expect(selected).toHaveLength(1)
		expect(selected[0]?.account.name).toBe('Main')
		expect(selected[0]?.date.toISOString().slice(0, 10)).toBe('2025-02-01')
	})

	it('ignores type/category/payee/tag filters', () => {
		const transactions = [
			createIncome('2025-02-01', 'Main'),
			createIncome('2025-02-03', 'Main'),
		]
		const baseState = createState({
			dateRange: {
				start: new Date('2025-02-01'),
				end: new Date('2025-02-28'),
			},
			accounts: ['Main'],
		})
		const withExtraFilters = createState({
			...baseState,
			transactionTypes: ['Expense'],
			categories: ['Food'],
			payees: ['Store'],
			tags: [
				{
					category: 'Group',
					values: ['B'],
					mode: 'include',
				},
			],
		})

		const baseResult = selectNetWorthTransactions(transactions, baseState)
		const extraResult = selectNetWorthTransactions(
			transactions,
			withExtraFilters
		)

		expect(extraResult).toEqual(baseResult)
	})
})
