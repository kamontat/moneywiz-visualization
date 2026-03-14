import type {
	ParsedExpenseTransaction,
	ParsedGiveawayTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedTransaction,
	ParsedWindfallTransaction,
} from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { bySummarize } from './bySummarize'
import { transform } from './transform'

const createIncome = (amount: number): ParsedIncomeTransaction => {
	const base = {
		id: 1,
		account: { type: 'Wallet' as const, name: 'Wallet', extra: null },
		description: 'Income transaction',
		amount: { value: amount, currency: 'THB' },
		date: new Date('2026-01-01T00:00:00.000Z'),
		memo: '',
		tags: [],
		raw: {},
	}

	return {
		...base,
		type: 'Income',
		payee: 'Test',
		category: { category: 'Test', subcategory: 'Test' },
		checkNumber: '',
	}
}

const createExpense = (amount: number): ParsedExpenseTransaction => ({
	...createIncome(amount),
	type: 'Expense',
})

const createRefund = (amount: number): ParsedRefundTransaction => ({
	...createIncome(amount),
	type: 'Refund',
})

const createWindfall = (amount: number): ParsedWindfallTransaction => ({
	...createIncome(amount),
	type: 'Windfall',
})

const createGiveaway = (amount: number): ParsedGiveawayTransaction => ({
	...createIncome(amount),
	type: 'Giveaway',
})

describe('bySummarize', () => {
	it('includes windfall in income totals and giveaway in expense totals', () => {
		const summary = transform(
			[
				createIncome(1000),
				createWindfall(200),
				createExpense(-300),
				createGiveaway(-50),
				createRefund(20),
			] as ParsedTransaction[],
			bySummarize()
		)

		expect(summary.totalIncome).toBe(1200)
		expect(summary.grossExpenses).toBe(350)
		expect(summary.totalRefunds).toBe(20)
		expect(summary.netExpenses).toBe(330)
		expect(summary.netCashFlow).toBe(870)
		expect(summary.totalWindfall).toBe(200)
		expect(summary.totalGiveaway).toBe(50)
	})
})
