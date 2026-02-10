import type { CategoryTotal } from '$lib/analytics/transforms/models'
import type { ParsedTransactionType } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { toCategoryDoughnutData } from './categoryTotal'

const createTotals = (
	parents: CategoryTotal['parents']
): Partial<Record<ParsedTransactionType, CategoryTotal>> => ({
	Expense: {
		total: Object.values(parents).reduce(
			(sum, parent) => sum + parent.total,
			0
		),
		parents,
	},
	Income: {
		total: 0,
		parents: {},
	},
})

describe('toCategoryDoughnutData', () => {
	it('returns sorted top-level parent categories by absolute total', () => {
		const data = createTotals({
			Transport: { total: -30, children: { Taxi: -30 } },
			Food: { total: -200, children: { Dining: -200 } },
			Housing: { total: -120, children: { Rent: -120 } },
		})

		const result = toCategoryDoughnutData(data, 'Expense')

		expect(result.labels).toEqual(['Food', 'Housing', 'Transport'])
		expect(result.datasets[0]?.data).toEqual([200, 120, 30])
	})

	it('returns sorted subcategories when drilling into a parent category', () => {
		const data = createTotals({
			Food: {
				total: -230,
				children: {
					Groceries: -80,
					Dining: -150,
				},
			},
		})

		const result = toCategoryDoughnutData(data, 'Expense', { parent: 'Food' })

		expect(result.labels).toEqual(['Dining', 'Groceries'])
		expect(result.datasets[0]?.data).toEqual([150, 80])
	})

	it('maps empty subcategory to uncategorized label in drill-down view', () => {
		const data = createTotals({
			Food: {
				total: -100,
				children: {
					'': -100,
				},
			},
		})

		const result = toCategoryDoughnutData(data, 'Expense', { parent: 'Food' })

		expect(result.labels).toEqual(['(uncategorized)'])
		expect(result.datasets[0]?.data).toEqual([100])
	})

	it('returns empty data when transaction type does not exist', () => {
		const result = toCategoryDoughnutData(
			{} as Partial<Record<ParsedTransactionType, CategoryTotal>>,
			'Expense'
		)

		expect(result.labels).toEqual([])
		expect(result.datasets).toEqual([])
	})
})
