import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { byPayeeSpend } from './byPayeeSpend'
import { transform } from './transform'

type SupportedType = 'Expense' | 'Giveaway' | 'Refund'

const createTransaction = (
	type: SupportedType,
	payee: string,
	amount: number,
	date: string
): ParsedTransaction => ({
	account: { type: 'Checking', name: 'Cash', extra: null },
	description: `${type} transaction`,
	amount: { value: amount, currency: 'THB' },
	date: new Date(date),
	memo: '',
	tags: [],
	raw: {},
	type,
	payee,
	category: { category: 'Food', subcategory: '' },
	checkNumber: '',
})

describe('byPayeeSpend', () => {
	it('calculates net spend as expense + giveaway - refund', () => {
		const analysis = transform(
			[
				createTransaction('Expense', 'Cafe', -120, '2026-01-10T00:00:00.000Z'),
				createTransaction('Giveaway', 'Cafe', -30, '2026-01-11T00:00:00.000Z'),
				createTransaction('Refund', 'Cafe', 20, '2026-01-12T00:00:00.000Z'),
			],
			byPayeeSpend(8)
		)

		expect(analysis.uniquePayeeCount).toBe(1)
		expect(analysis.totalNetSpend).toBe(130)
		expect(analysis.topPayees[0]?.payee).toBe('Cafe')
		expect(analysis.topPayees[0]?.netSpend).toBe(130)
		expect(analysis.topPayees[0]?.transactionCount).toBe(3)
		expect(analysis.topPayees[0]?.avgTicket).toBeCloseTo(43.33, 2)
	})

	it('normalizes blank payee names to Unknown Payee', () => {
		const analysis = transform(
			[createTransaction('Expense', '   ', -100, '2026-01-10T00:00:00.000Z')],
			byPayeeSpend(8)
		)

		expect(analysis.topPayees[0]?.payee).toBe('Unknown Payee')
	})

	it('drops payees with non-positive net spend', () => {
		const analysis = transform(
			[
				createTransaction('Expense', 'Zero', -50, '2026-01-10T00:00:00.000Z'),
				createTransaction('Refund', 'Zero', 50, '2026-01-10T01:00:00.000Z'),
				createTransaction(
					'Expense',
					'Negative',
					-20,
					'2026-01-11T00:00:00.000Z'
				),
				createTransaction('Refund', 'Negative', 40, '2026-01-11T01:00:00.000Z'),
				createTransaction(
					'Expense',
					'Positive',
					-10,
					'2026-01-12T00:00:00.000Z'
				),
			],
			byPayeeSpend(8)
		)

		expect(analysis.uniquePayeeCount).toBe(1)
		expect(analysis.topPayees).toHaveLength(1)
		expect(analysis.topPayees[0]?.payee).toBe('Positive')
	})

	it('sorts by net spend, then transaction count, then payee name', () => {
		const analysis = transform(
			[
				createTransaction('Expense', 'Beta', -60, '2026-01-01T00:00:00.000Z'),
				createTransaction('Expense', 'Beta', -40, '2026-01-02T00:00:00.000Z'),
				createTransaction(
					'Expense',
					'Charlie',
					-100,
					'2026-01-01T00:00:00.000Z'
				),
				createTransaction('Expense', 'Alpha', -100, '2026-01-01T00:00:00.000Z'),
				createTransaction('Expense', 'Delta', -90, '2026-01-01T00:00:00.000Z'),
			],
			byPayeeSpend(8)
		)

		expect(analysis.topPayees.map((payee) => payee.payee)).toEqual([
			'Beta',
			'Alpha',
			'Charlie',
			'Delta',
		])
	})

	it('returns only top 8 payees', () => {
		const transactions = Array.from({ length: 10 }, (_, index) =>
			createTransaction(
				'Expense',
				`Payee ${index + 1}`,
				-(index + 1) * 10,
				`2026-01-${(index + 1).toString().padStart(2, '0')}T00:00:00.000Z`
			)
		)

		const analysis = transform(transactions, byPayeeSpend(8))

		expect(analysis.topPayees).toHaveLength(8)
		expect(analysis.topPayees[0]?.payee).toBe('Payee 10')
		expect(analysis.topPayees[7]?.payee).toBe('Payee 3')
	})

	it('uses daily mode when payee has fewer than 50 transactions', () => {
		const transactions = Array.from({ length: 49 }, (_, index) =>
			createTransaction(
				'Expense',
				'Daily Payee',
				-10,
				`2026-01-${((index % 28) + 1).toString().padStart(2, '0')}T00:00:00.000Z`
			)
		)

		const analysis = transform(transactions, byPayeeSpend(8))
		expect(analysis.seriesByPayee['Daily Payee']?.mode).toBe('Daily')
	})

	it('uses monthly mode when payee has at least 50 transactions', () => {
		const january = Array.from({ length: 25 }, (_, index) =>
			createTransaction(
				'Expense',
				'Monthly Payee',
				-10,
				`2026-01-${((index % 28) + 1).toString().padStart(2, '0')}T00:00:00.000Z`
			)
		)
		const february = Array.from({ length: 25 }, (_, index) =>
			createTransaction(
				'Expense',
				'Monthly Payee',
				-10,
				`2026-02-${((index % 28) + 1).toString().padStart(2, '0')}T00:00:00.000Z`
			)
		)

		const analysis = transform([...january, ...february], byPayeeSpend(8))
		const series = analysis.seriesByPayee['Monthly Payee']

		expect(series?.mode).toBe('Monthly')
		expect(series?.points).toHaveLength(2)
		expect(series?.points[0]?.label).toBe('Jan 2026')
		expect(series?.points[1]?.label).toBe('Feb 2026')
	})

	it('sorts series points chronologically', () => {
		const analysis = transform(
			[
				createTransaction('Expense', 'Cafe', -30, '2026-03-10T00:00:00.000Z'),
				createTransaction('Expense', 'Cafe', -20, '2026-01-05T00:00:00.000Z'),
				createTransaction('Expense', 'Cafe', -10, '2026-02-01T00:00:00.000Z'),
			],
			byPayeeSpend(8)
		)
		const points = analysis.seriesByPayee.Cafe?.points ?? []

		expect(points[0]?.date.getTime()).toBeLessThan(points[1]?.date.getTime())
		expect(points[1]?.date.getTime()).toBeLessThan(points[2]?.date.getTime())
	})
})
