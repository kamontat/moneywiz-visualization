import type {
	ParsedExpenseTransaction,
	ParsedTransaction,
} from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import {
	deriveBaselineRange,
	deriveCurrentRange,
	sliceByDateRange,
} from './statsPeriod'

import { formatDate } from '$lib/formatters/date'

const createExpense = (date: string): ParsedExpenseTransaction => ({
	account: { type: 'Checking', name: 'Main', extra: null },
	description: 'expense',
	amount: { value: -100, currency: 'THB' },
	date: new Date(date),
	memo: '',
	tags: [],
	raw: {},
	type: 'Expense',
	payee: 'Shop',
	category: { category: 'Food', subcategory: '' },
	checkNumber: '',
})

describe('statsPeriod', () => {
	it('derives current range from explicit start/end and builds previous baseline', () => {
		const transactions: ParsedTransaction[] = [
			createExpense('2026-01-01T12:00:00.000Z'),
			createExpense('2026-01-10T12:00:00.000Z'),
		]

		const current = deriveCurrentRange(
			transactions,
			new Date('2026-01-03T00:00:00.000Z'),
			new Date('2026-01-08T00:00:00.000Z')
		)
		const baseline = deriveBaselineRange(current)

		expect(current?.days).toBe(6)
		expect(current ? formatDate(current.start, 'YYYY-MM-DD') : '').toBe(
			'2026-01-03'
		)
		expect(current ? formatDate(current.end, 'YYYY-MM-DD') : '').toBe(
			'2026-01-08'
		)
		expect(baseline ? formatDate(baseline.start, 'YYYY-MM-DD') : '').toBe(
			'2025-12-28'
		)
		expect(baseline ? formatDate(baseline.end, 'YYYY-MM-DD') : '').toBe(
			'2026-01-02'
		)
		expect(baseline?.days).toBe(6)
	})

	it('uses latest 30-day window when explicit range is missing', () => {
		const transactions: ParsedTransaction[] = [
			createExpense('2026-01-01T12:00:00.000Z'),
			createExpense('2026-02-11T12:00:00.000Z'),
		]

		const range = deriveCurrentRange(transactions)

		expect(range?.days).toBe(30)
		expect(range ? formatDate(range.start, 'YYYY-MM-DD') : '').toBe(
			'2026-01-13'
		)
		expect(range ? formatDate(range.end, 'YYYY-MM-DD') : '').toBe('2026-02-11')
	})

	it('filters transactions inclusively by date range', () => {
		const transactions: ParsedTransaction[] = [
			createExpense('2026-02-01T00:00:00.000Z'),
			createExpense('2026-02-02T00:00:00.000Z'),
			createExpense('2026-02-03T00:00:00.000Z'),
		]
		const range = deriveCurrentRange(
			transactions,
			new Date('2026-02-01T00:00:00.000Z'),
			new Date('2026-02-02T00:00:00.000Z')
		)

		const sliced = sliceByDateRange(transactions, range)

		expect(sliced).toHaveLength(2)
		expect(sliced[0]?.date.toISOString()).toContain('2026-02-01')
		expect(sliced[1]?.date.toISOString()).toContain('2026-02-02')
	})
})
