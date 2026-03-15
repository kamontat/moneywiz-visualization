import type { DataTransaction } from '$lib/apis/record/transactions/types'
import { describe, expect, it } from 'vitest'

import { byAccount } from './filters/byAccount'
import { byCategory } from './filters/byCategory'
import { byDateRange } from './filters/byDateRange'
import { byPayee } from './filters/byPayee'
import { byTags } from './filters/byTags'
import { byTransactionType } from './filters/byTransactionType'
import { groupByCategory } from './maps/groupByCategory'
import { groupByPayee } from './maps/groupByPayee'
import { groupByTemporal } from './maps/groupByTemporal'
import { calculateNetIncome } from './reduces/calculateNetIncome'
import { calculateSavingsRate } from './reduces/calculateSavingsRate'
import { sumAmount } from './reduces/sumAmount'

function tx(
	overrides: Partial<DataTransaction> & { id: number }
): DataTransaction {
	return {
		type: 'expense',
		date: new Date('2026-01-15'),
		amount: -100,
		currency: 'THB',
		category: 'Food',
		subcategory: 'Dining',
		payee: 'Restaurant',
		accountId: 1,
		accountName: 'Wallet',
		notes: '',
		tags: [],
		...overrides,
	} as DataTransaction
}

// --- Filters ---

describe('byDateRange', () => {
	const data = [
		tx({ id: 1, date: new Date('2026-01-01') }),
		tx({ id: 2, date: new Date('2026-02-15') }),
		tx({ id: 3, date: new Date('2026-03-31') }),
	]

	it('returns transactions within range', () => {
		const filter = byDateRange(new Date('2026-01-01'), new Date('2026-02-28'))
		const result = filter(data)
		expect(result.map((t) => t.id)).toEqual([1, 2])
	})

	it('returns empty for no matches', () => {
		const filter = byDateRange(new Date('2025-01-01'), new Date('2025-12-31'))
		expect(filter(data)).toEqual([])
	})

	it('includes boundary dates', () => {
		const filter = byDateRange(new Date('2026-01-01'), new Date('2026-01-01'))
		expect(filter(data).map((t) => t.id)).toEqual([1])
	})
})

describe('byTransactionType', () => {
	const data = [
		tx({ id: 1, type: 'income' }),
		tx({ id: 2, type: 'expense' }),
		tx({ id: 3, type: 'transfer' }),
	]

	it('filters by single type', () => {
		const result = byTransactionType(['income'])(data)
		expect(result.map((t) => t.id)).toEqual([1])
	})

	it('filters by multiple types', () => {
		const result = byTransactionType(['income', 'transfer'])(data)
		expect(result.map((t) => t.id)).toEqual([1, 3])
	})
})

describe('byCategory', () => {
	const data = [
		tx({ id: 1, category: 'Food' }),
		tx({ id: 2, category: 'Transport' }),
		tx({ id: 3, category: 'Food' }),
	]

	it('filters by category', () => {
		const result = byCategory(['Food'])(data)
		expect(result.map((t) => t.id)).toEqual([1, 3])
	})
})

describe('byPayee', () => {
	const data = [tx({ id: 1, payee: 'Alice' }), tx({ id: 2, payee: 'Bob' })]

	it('filters by payee', () => {
		const result = byPayee(['Bob'])(data)
		expect(result.map((t) => t.id)).toEqual([2])
	})
})

describe('byAccount', () => {
	const data = [
		tx({ id: 1, accountId: 1 }),
		tx({ id: 2, accountId: 2 }),
		tx({ id: 3, accountId: 1 }),
	]

	it('filters by account id', () => {
		const result = byAccount([2])(data)
		expect(result.map((t) => t.id)).toEqual([2])
	})
})

describe('byTags', () => {
	const data = [
		tx({ id: 1, tags: [{ category: 'Priority', name: 'High' }] }),
		tx({ id: 2, tags: [{ category: 'Priority', name: 'Low' }] }),
		tx({ id: 3, tags: [] }),
	]

	it('filters by tag category:name', () => {
		const result = byTags(['Priority:High'])(data)
		expect(result.map((t) => t.id)).toEqual([1])
	})

	it('returns empty when no tags match', () => {
		expect(byTags(['Priority:Medium'])(data)).toEqual([])
	})
})

// --- Maps ---

describe('groupByCategory', () => {
	const data = [
		tx({ id: 1, category: 'Food' }),
		tx({ id: 2, category: 'Transport' }),
		tx({ id: 3, category: 'Food' }),
		tx({ id: 4, category: '' }),
	]

	it('groups transactions by category', () => {
		const groups = groupByCategory()(data)
		expect(groups).toHaveLength(3)
		expect(
			groups.find((g) => g.category === 'Food')?.transactions
		).toHaveLength(2)
		expect(
			groups.find((g) => g.category === '(uncategorized)')?.transactions
		).toHaveLength(1)
	})
})

describe('groupByPayee', () => {
	const data = [
		tx({ id: 1, payee: 'Alice' }),
		tx({ id: 2, payee: 'Alice' }),
		tx({ id: 3, payee: '' }),
	]

	it('groups and handles empty payee', () => {
		const groups = groupByPayee()(data)
		expect(groups.find((g) => g.payee === 'Alice')?.transactions).toHaveLength(
			2
		)
		expect(
			groups.find((g) => g.payee === '(no payee)')?.transactions
		).toHaveLength(1)
	})
})

describe('groupByTemporal', () => {
	const data = [
		tx({ id: 1, date: new Date('2026-01-15') }),
		tx({ id: 2, date: new Date('2026-01-20') }),
		tx({ id: 3, date: new Date('2026-02-10') }),
	]

	it('groups by month', () => {
		const groups = groupByTemporal('month')(data)
		expect(groups).toHaveLength(2)
		expect(
			groups.find((g) => g.period === '2026-01')?.transactions
		).toHaveLength(2)
		expect(
			groups.find((g) => g.period === '2026-02')?.transactions
		).toHaveLength(1)
	})

	it('groups by year', () => {
		const groups = groupByTemporal('year')(data)
		expect(groups).toHaveLength(1)
		expect(groups[0].period).toBe('2026')
	})

	it('groups by day', () => {
		const groups = groupByTemporal('day')(data)
		expect(groups).toHaveLength(3)
	})
})

// --- Reduces ---

describe('sumAmount', () => {
	it('sums all transaction amounts', () => {
		const data = [
			tx({ id: 1, amount: -100 }),
			tx({ id: 2, amount: -50 }),
			tx({ id: 3, amount: 200 }),
		]
		expect(sumAmount()(0, data)).toBe(50)
	})

	it('adds to initial value', () => {
		const data = [tx({ id: 1, amount: -100 })]
		expect(sumAmount()(500, data)).toBe(400)
	})
})

describe('calculateNetIncome', () => {
	const data = [
		tx({ id: 1, type: 'income', amount: 1000 }),
		tx({ id: 2, type: 'expense', amount: -400 }),
		tx({ id: 3, type: 'refund', amount: 50 }),
		tx({ id: 4, type: 'transfer', amount: -200 }),
	]

	it('calculates income, expense, and net', () => {
		const init = { income: 0, expense: 0, net: 0 }
		const result = calculateNetIncome()(init, data)
		expect(result.income).toBe(1050) // income + refund
		expect(result.expense).toBe(-400) // expense only
		expect(result.net).toBe(650) // 1050 + (-400)
	})

	it('ignores transfers', () => {
		const init = { income: 0, expense: 0, net: 0 }
		const result = calculateNetIncome()(init, [
			tx({ id: 1, type: 'transfer', amount: -500 }),
		])
		expect(result).toEqual({ income: 0, expense: 0, net: 0 })
	})
})

describe('calculateSavingsRate', () => {
	it('computes savings rate', () => {
		const data = [
			tx({ id: 1, type: 'income', amount: 1000 }),
			tx({ id: 2, type: 'expense', amount: -300 }),
		]
		const init = { income: 0, expense: 0, rate: 0 }
		const result = calculateSavingsRate()(init, data)
		expect(result.income).toBe(1000)
		expect(result.expense).toBe(-300)
		expect(result.rate).toBeCloseTo(0.7)
	})

	it('returns 0 rate when income is zero', () => {
		const data = [tx({ id: 1, type: 'expense', amount: -100 })]
		const init = { income: 0, expense: 0, rate: 0 }
		const result = calculateSavingsRate()(init, data)
		expect(result.rate).toBe(0)
	})
})
