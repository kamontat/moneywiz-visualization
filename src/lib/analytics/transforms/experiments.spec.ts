import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import {
	byCategoryBubble,
	byMonthlyWaterfall,
	byOutlierTimeline,
	byRegimeTimeline,
	transform,
} from './index'

const base = {
	account: { type: 'Checking', name: 'Cash', extra: null },
	description: '',
	memo: '',
	tags: [],
	raw: {},
	date: new Date('2025-01-10'),
}

const expense = (
	amount: number,
	date: string,
	category = 'Food'
): ParsedTransaction => ({
	...base,
	account: { type: 'Checking' as const, name: 'Cash', extra: null },
	type: 'Expense',
	payee: 'Store',
	amount: { value: -Math.abs(amount), currency: 'THB' },
	date: new Date(date),
	category: { category, subcategory: '' },
	checkNumber: '',
})

const income = (amount: number, date: string): ParsedTransaction => ({
	...base,
	account: { type: 'Checking' as const, name: 'Cash', extra: null },
	type: 'Income',
	payee: 'Employer',
	amount: { value: amount, currency: 'THB' },
	date: new Date(date),
	category: { category: 'Compensation', subcategory: 'Salary' },
	checkNumber: '',
})

describe('experiment transforms', () => {
	it('returns empty-safe structures for empty input', () => {
		expect(transform([], byMonthlyWaterfall)).toEqual([])
		expect(transform([], byRegimeTimeline)).toEqual([])
		expect(transform([], byOutlierTimeline)).toEqual([])
		expect(transform([], byCategoryBubble)).toEqual([])
	})

	it('computes monthly waterfall net values', () => {
		const points = transform(
			[income(1000, '2025-01-01'), expense(200, '2025-01-15')],
			byMonthlyWaterfall
		)

		expect(points).toHaveLength(1)
		expect(points[0].net).toBe(800)
		expect(points[0].endBalance).toBe(800)
	})

	it('classifies regime transitions with threshold', () => {
		const segments = transform(
			[
				income(1000, '2025-01-01'),
				expense(700, '2025-01-02'),
				income(1000, '2025-02-01'),
				expense(950, '2025-02-03'),
				income(1000, '2025-03-01'),
				expense(1200, '2025-03-04'),
			],
			byRegimeTimeline
		)

		expect(segments.map((s) => s.regime)).toEqual([
			'Stable',
			'Stressed',
			'Deficit',
		])
	})

	it('flags outlier spikes with rolling z-score', () => {
		const normalDays = Array.from({ length: 35 }, (_, i) => {
			const date = new Date('2025-01-01')
			date.setDate(date.getDate() + i)
			return expense(10, date.toISOString().slice(0, 10))
		})
		const spike = expense(1000, '2025-02-10')
		const outliers = transform([...normalDays, spike], byOutlierTimeline)
		const flagged = outliers.filter((point) => point.isOutlier)

		expect(flagged.length).toBeGreaterThan(0)
		expect(flagged.at(-1)?.value).toBeGreaterThan(100)
	})
})
