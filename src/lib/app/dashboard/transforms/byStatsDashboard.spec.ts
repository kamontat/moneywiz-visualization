import type {
	ParsedDebtTransaction,
	ParsedExpenseTransaction,
	ParsedGiveawayTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedSellTransaction,
	ParsedTransaction,
} from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { byStatsDashboard } from './byStatsDashboard'
import { transform } from './transform'

const base = (date: string, amount: number, currency = 'THB') => ({
	account: { type: 'Checking' as const, name: 'Main', extra: null },
	description: 'transaction',
	amount: { value: amount, currency },
	date: new Date(date),
	memo: '',
	tags: [],
	raw: {},
})

const createIncome = (
	amount: number,
	date: string,
	payee = 'Salary',
	category = 'Income',
	subcategory = ''
): ParsedIncomeTransaction => ({
	...base(date, amount),
	type: 'Income',
	payee,
	category: { category, subcategory },
	checkNumber: '',
})

const createExpense = (
	amount: number,
	date: string,
	payee = 'Cafe',
	category = 'Food',
	subcategory = '',
	currency = 'THB'
): ParsedExpenseTransaction => ({
	...base(date, amount, currency),
	type: 'Expense',
	payee,
	category: { category, subcategory },
	checkNumber: '',
})

const createRefund = (
	amount: number,
	date: string,
	payee = 'Cafe'
): ParsedRefundTransaction => ({
	...base(date, amount),
	type: 'Refund',
	payee,
	category: { category: 'Food', subcategory: '' },
	checkNumber: '',
})

const createDebt = (amount: number, date: string): ParsedDebtTransaction => ({
	...base(date, amount),
	type: 'Debt',
	payee: 'Bank',
	category: { category: 'Debt', subcategory: '' },
	checkNumber: '',
})

const createGiveaway = (
	amount: number,
	date: string,
	payee = 'Friend'
): ParsedGiveawayTransaction => ({
	...base(date, amount),
	type: 'Giveaway',
	payee,
	category: { category: 'Giveaway', subcategory: '' },
	checkNumber: '',
})

const createSell = (amount: number, date: string): ParsedSellTransaction => ({
	...base(date, amount),
	type: 'Sell',
	payee: 'Broker',
	checkNumber: '',
})

describe('byStatsDashboard', () => {
	it('builds KPI and comparison deltas against baseline', () => {
		const current: ParsedTransaction[] = [
			createIncome(1000, '2026-01-01T00:00:00.000Z'),
			createExpense(-400, '2026-01-01T08:00:00.000Z'),
			createRefund(50, '2026-01-02T00:00:00.000Z'),
			createDebt(-100, '2026-01-02T12:00:00.000Z'),
			createGiveaway(-40, '2026-01-03T00:00:00.000Z'),
			createSell(70, '2026-01-03T12:00:00.000Z'),
		]
		const baseline: ParsedTransaction[] = [
			createIncome(700, '2025-12-20T00:00:00.000Z'),
			createExpense(-500, '2025-12-21T00:00:00.000Z'),
		]

		const stats = transform(
			current,
			byStatsDashboard(baseline, {
				topCategoryLimit: 3,
				topPayeeLimit: 3,
			})
		)

		const netCashFlow = stats.kpis.find((item) => item.id === 'netCashFlow')
		expect(netCashFlow?.value).toBe(610)
		expect(netCashFlow?.delta.baseline).toBe(200)
		expect(netCashFlow?.delta.delta).toBe(410)
		expect(stats.comparison).toHaveLength(4)
		expect(stats.flowMix).toHaveLength(9)
	})

	it('marks mixed currency and picks dominant currency', () => {
		const current: ParsedTransaction[] = [
			createIncome(1000, '2026-01-01T00:00:00.000Z'),
			createExpense(
				-200,
				'2026-01-02T00:00:00.000Z',
				'US Shop',
				'Travel',
				'',
				'USD'
			),
			createExpense(
				-100,
				'2026-01-03T00:00:00.000Z',
				'Local',
				'Food',
				'',
				'THB'
			),
		]

		const stats = transform(current, byStatsDashboard([]))

		expect(stats.currency.mixedCurrency).toBe(true)
		expect(stats.currency.primaryCurrency).toBe('THB')
	})

	it('computes cadence and hygiene metrics with provided range', () => {
		const current: ParsedTransaction[] = [
			createExpense(-100, '2026-02-01T00:00:00.000Z', '', '', ''),
			createIncome(
				150,
				'2026-02-03T00:00:00.000Z',
				'Salary',
				'Income',
				'Monthly'
			),
		]

		const stats = transform(
			current,
			byStatsDashboard([], {
				currentRange: {
					start: new Date('2026-02-01T00:00:00.000Z'),
					end: new Date('2026-02-03T23:59:59.999Z'),
					days: 3,
					label: '01 Feb 2026 - 03 Feb 2026',
				},
			})
		)

		expect(stats.cadence.activeDays).toBe(2)
		expect(stats.cadence.noSpendDays).toBe(1)
		expect(stats.cadence.avgTransactionsPerActiveDay).toBe(1)
		expect(stats.cadence.uncategorizedRate).toBe(50)
		expect(stats.cadence.unknownPayeeRate).toBe(50)
	})
})
