import type {
	LedgerAccountBalanceRow,
	ParsedTransaction,
} from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { byNetWorthFromBalances } from './byNetWorthFromBalances'
import { transform } from './transform'

const income = (
	amount: number,
	date: string,
	accountName: string
): ParsedTransaction => ({
	type: 'Income',
	account: { type: 'Checking', name: accountName, extra: null },
	description: '',
	amount: { value: amount, currency: 'THB' },
	date: new Date(date),
	memo: '',
	payee: 'Employer',
	category: { category: 'Compensation', subcategory: 'Salary' },
	checkNumber: '',
	tags: [],
	raw: {},
})

const expense = (
	amount: number,
	date: string,
	accountName: string
): ParsedTransaction => ({
	type: 'Expense',
	account: { type: 'Checking', name: accountName, extra: null },
	description: '',
	amount: { value: -Math.abs(amount), currency: 'THB' },
	date: new Date(date),
	memo: '',
	payee: 'Store',
	category: { category: 'Food', subcategory: '' },
	checkNumber: '',
	tags: [],
	raw: {},
})

const balances: LedgerAccountBalanceRow[] = [
	{
		accountId: 1,
		name: 'Main',
		entityId: 10,
		currency: 'THB',
		isArchived: false,
		openingBalance: 1_000,
	},
	{
		accountId: 2,
		name: 'Savings',
		entityId: 11,
		currency: 'THB',
		isArchived: false,
		openingBalance: 500,
	},
	{
		accountId: 3,
		name: 'Loan',
		entityId: 14,
		currency: 'THB',
		isArchived: false,
		openingBalance: -2_000,
	},
	{
		accountId: 4,
		name: 'Old',
		entityId: 10,
		currency: 'THB',
		isArchived: true,
		openingBalance: 900,
	},
]

describe('byNetWorthFromBalances', () => {
	it('excludes archived and loan accounts from current net worth', () => {
		const summary = transform(
			[],
			byNetWorthFromBalances({
				accountBalances: balances,
			})
		)

		expect(summary.currentNetWorth).toBe(1_500)
		expect(summary.peakNetWorth).toBe(1_500)
		expect(summary.troughNetWorth).toBe(1_500)
		expect(summary.points).toEqual([])
	})

	it('rebases monthly trend so latest point equals selected account balances', () => {
		const summary = transform(
			[
				income(100, '2025-01-10', 'Main'),
				expense(50, '2025-02-10', 'Main'),
				income(20, '2025-02-12', 'Savings'),
			],
			byNetWorthFromBalances({
				accountBalances: balances,
			})
		)

		expect(summary.points.map((point) => point.monthlyChange)).toEqual([
			100, -30,
		])
		expect(summary.points.at(-1)?.netWorth).toBe(1_500)
		expect(summary.currentNetWorth).toBe(1_500)
	})

	it('respects selected account scope for baseline rebasing', () => {
		const summary = transform(
			[income(100, '2025-01-10', 'Main'), expense(50, '2025-02-10', 'Main')],
			byNetWorthFromBalances({
				accountBalances: balances,
				selectedAccounts: ['Main'],
			})
		)

		expect(summary.points.at(-1)?.netWorth).toBe(1_000)
		expect(summary.currentNetWorth).toBe(1_000)
	})
})
