import type {
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedTransaction,
} from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { byCashFlowDashboard } from './byCashFlowDashboard'
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
	category = 'Compensation',
	subcategory = 'Salary'
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
	payee = 'Groceries',
	category = 'Food',
	subcategory = ''
): ParsedExpenseTransaction => ({
	...base(date, amount),
	type: 'Expense',
	payee,
	category: { category, subcategory },
	checkNumber: '',
})

const createRefund = (
	amount: number,
	date: string,
	payee = 'Groceries'
): ParsedRefundTransaction => ({
	...base(date, amount),
	type: 'Refund',
	payee,
	category: { category: 'Food', subcategory: '' },
	checkNumber: '',
})

describe('byCashFlowDashboard', () => {
	it('builds KPI deltas and dashboard payloads', () => {
		const current: ParsedTransaction[] = [
			createIncome(3000, '2026-01-01T00:00:00.000Z'),
			createExpense(-1000, '2026-01-02T00:00:00.000Z', 'Rent', 'Housing'),
			createRefund(100, '2026-01-03T00:00:00.000Z'),
			createExpense(-400, '2026-01-04T00:00:00.000Z'),
		]
		const baseline: ParsedTransaction[] = [
			createIncome(2400, '2025-12-28T00:00:00.000Z'),
			createExpense(-1200, '2025-12-30T00:00:00.000Z', 'Rent', 'Housing'),
		]

		const dashboard = transform(
			current,
			byCashFlowDashboard(baseline, {
				currentRange: {
					start: new Date('2026-01-01T00:00:00.000Z'),
					end: new Date('2026-01-04T23:59:59.999Z'),
					days: 4,
					label: '01 Jan 2026 - 04 Jan 2026',
				},
				baselineRange: {
					start: new Date('2025-12-28T00:00:00.000Z'),
					end: new Date('2025-12-31T23:59:59.999Z'),
					days: 4,
					label: '28 Dec 2025 - 31 Dec 2025',
				},
			})
		)

		expect(dashboard.kpis).toHaveLength(4)
		expect(dashboard.transactionCount).toBe(4)
		expect(dashboard.baselineTransactionCount).toBe(2)

		const netCashFlow = dashboard.kpis.find((item) => item.id === 'netCashFlow')
		expect(netCashFlow?.value).toBe(1700)
		expect(netCashFlow?.delta.baseline).toBe(1200)
		expect(netCashFlow?.delta.delta).toBe(500)

		const savingsRate = dashboard.kpis.find((item) => item.id === 'savingsRate')
		expect(savingsRate?.value).toBeCloseTo(56.6667, 4)
		expect(savingsRate?.delta.baseline).toBe(50)
		expect(savingsRate?.delta.delta).toBeCloseTo(6.6667, 4)

		const dailyIncome = dashboard.kpis.find((item) => item.id === 'dailyIncome')
		expect(dailyIncome?.value).toBe(750)
		expect(dailyIncome?.delta.baseline).toBe(600)
		expect(dailyIncome?.delta.delta).toBe(150)

		const dailyExpense = dashboard.kpis.find(
			(item) => item.id === 'dailyExpense'
		)
		expect(dailyExpense?.value).toBe(325)
		expect(dailyExpense?.delta.baseline).toBe(300)
		expect(dailyExpense?.delta.delta).toBe(25)
		expect(dailyExpense?.betterWhen).toBe('lower')

		expect(dashboard.trend.mode).toBe('Daily')
		expect(dashboard.trend.points).toHaveLength(4)
		expect(dashboard.decomposition).toHaveLength(1)
		expect(dashboard.categoryDrivers.Income).toBeDefined()
		expect(dashboard.categoryDrivers.Expense).toBeDefined()
	})

	it('returns null baseline deltas when baseline period is empty', () => {
		const current: ParsedTransaction[] = [
			createIncome(900, '2026-02-01T00:00:00.000Z'),
			createExpense(-300, '2026-02-02T00:00:00.000Z'),
		]

		const dashboard = transform(
			current,
			byCashFlowDashboard([], {
				currentRange: {
					start: new Date('2026-02-01T00:00:00.000Z'),
					end: new Date('2026-02-02T23:59:59.999Z'),
					days: 2,
					label: '01 Feb 2026 - 02 Feb 2026',
				},
				baselineRange: null,
			})
		)

		expect(dashboard.baselineRange).toBeNull()
		expect(dashboard.baselineTransactionCount).toBe(0)
		expect(dashboard.kpis).toHaveLength(4)
		expect(
			dashboard.kpis.every((metric) => metric.delta.baseline === null)
		).toBe(true)
		expect(dashboard.kpis.every((metric) => metric.delta.delta === null)).toBe(
			true
		)
		expect(dashboard.kpis.every((metric) => metric.delta.trend === 'na')).toBe(
			true
		)
	})
})
