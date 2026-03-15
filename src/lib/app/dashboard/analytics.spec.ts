import type { DataTransaction } from '$lib/apis/record/transactions/types'
import { describe, expect, it } from 'vitest'

import {
	deriveBaselineRange,
	deriveCurrentRange,
	sliceByDateRange,
	summarizeTransactions,
} from './analytics'

function tx(
	id: number,
	type: DataTransaction['type'],
	amount: number,
	date: string
): DataTransaction {
	return {
		id,
		type,
		date: new Date(date),
		amount,
		currency: 'THB',
		category: 'Food',
		subcategory: '',
		payee: 'Test',
		accountId: 1,
		accountName: 'Wallet',
		notes: '',
		tags: [],
	} as DataTransaction
}

describe('dashboard analytics adapter', () => {
	it('summarizes converted V3 transactions into the legacy summary shape', () => {
		const summary = summarizeTransactions([
			tx(1, 'income', 1000, '2026-01-01'),
			tx(2, 'expense', -300, '2026-01-05'),
			tx(3, 'refund', 50, '2026-01-10'),
			tx(4, 'debt', -100, '2026-01-12'),
			tx(5, 'debt_repayment', 100, '2026-01-15'),
			tx(6, 'windfall', 200, '2026-01-20'),
			tx(7, 'giveaway', -25, '2026-01-21'),
			tx(8, 'buy', -40, '2026-01-22'),
			tx(9, 'sell', 60, '2026-01-23'),
		])

		expect(summary).toMatchObject({
			totalIncome: 1200,
			grossExpenses: 325,
			totalRefunds: 50,
			netExpenses: 275,
			netCashFlow: 925,
			transactionCount: 9,
			totalDebt: 100,
			totalDebtRepayment: 100,
			totalWindfall: 200,
			totalGiveaway: 25,
			totalBuy: 40,
			totalSell: 60,
		})
		expect(summary?.savingsRate).toBeCloseTo(77.083333, 5)
	})

	it('derives current and baseline ranges and slices transactions by range', () => {
		const transactions = [
			tx(1, 'income', 100, '2026-02-01'),
			tx(2, 'expense', -50, '2026-02-03'),
			tx(3, 'expense', -10, '2026-02-10'),
		]

		const currentRange = deriveCurrentRange(
			transactions,
			new Date('2026-02-02'),
			new Date('2026-02-08')
		)
		const baselineRange = deriveBaselineRange(currentRange)

		expect(currentRange?.days).toBe(7)
		expect(baselineRange?.days).toBe(7)
		expect(
			sliceByDateRange(transactions, currentRange).map((t) => t.id)
		).toEqual([2])
	})
})
