import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, it, expect } from 'vitest'

import { byCategory } from './byCategory'
import { byCurrency } from './byCurrency'
import { byDateRange } from './byDateRange'
import { byTags } from './byTags'
import { byTransactionType } from './byTransactionType'
import { byTransfer } from './byTransfer'
import { filter, byAND, byOR, byNOT } from './filter'

const createTransaction = (
	overrides: Partial<ParsedTransaction> = {}
): ParsedTransaction =>
	({
		type: 'Expense',
		id: 1,
		account: { type: 'Checking', name: 'Test', extra: null },
		description: 'Test',
		amount: { value: -100, currency: 'THB' },
		date: new Date(2026, 0, 15),
		memo: '',
		tags: [],
		raw: {},
		payee: 'Test Payee',
		category: { category: 'Food', subcategory: 'Restaurant' },
		checkNumber: '',
		...overrides,
	}) as ParsedTransaction

const sampleTransactions: ParsedTransaction[] = [
	createTransaction({
		id: 1,
		type: 'Expense',
		amount: { value: -100, currency: 'THB' },
		date: new Date(2026, 0, 10),
		category: { category: 'Food', subcategory: 'Restaurant' },
		tags: [{ category: 'Group', name: 'Friends' }],
	}),
	createTransaction({
		id: 2,
		type: 'Income',
		amount: { value: 50000, currency: 'THB' },
		date: new Date(2026, 0, 20),
		category: { category: 'Compensation', subcategory: 'Salary' },
		tags: [],
	}),
	{
		type: 'Transfer',
		id: 3,
		account: { type: 'Checking', name: 'From', extra: null },
		description: 'Transfer',
		amount: { value: -500, currency: 'THB' },
		date: new Date(2026, 1, 5),
		memo: '',
		tags: [],
		raw: {},
		transfer: { type: 'Checking', name: 'To', extra: null },
	} as ParsedTransaction,
	createTransaction({
		id: 4,
		type: 'Expense',
		amount: { value: -200, currency: 'USD' },
		date: new Date(2026, 1, 15),
		category: { category: 'Transport', subcategory: 'Taxi' },
		tags: [
			{ category: 'Group', name: 'Work' },
			{ category: 'Event', name: 'Conference' },
		],
	}),
	createTransaction({
		id: 5,
		type: 'Refund',
		amount: { value: 50, currency: 'THB' },
		date: new Date(2026, 2, 1),
		category: { category: 'Food', subcategory: 'Restaurant' },
		tags: [{ category: 'Group', name: 'Friends' }],
	}),
]

describe('Filter chain composition (byAND, byOR, byNOT)', () => {
	it('byAND should require all filters to pass', () => {
		const combined = byAND(
			byCategory({ categories: ['Food'], mode: 'include' }),
			byCurrency('THB')
		)

		// Food + THB: id 1 (Expense, Food, THB) and id 5 (Refund, Food, THB)
		const result = sampleTransactions.filter(combined)
		expect(result).toHaveLength(2)
		expect(result.map((t) => t.id)).toEqual([1, 5])
	})

	it('byOR should pass if any filter passes', () => {
		const combined = byOR(
			byCategory({ categories: ['Food'], mode: 'include' }),
			byCategory({ categories: ['Transport'], mode: 'include' })
		)

		const result = sampleTransactions.filter(combined)
		expect(result).toHaveLength(3)
		expect(result.map((t) => t.id)).toEqual([1, 4, 5])
	})

	it('byOR should reject transactions matching no branch', () => {
		const combined = byOR(
			byCategory({ categories: ['Utilities'], mode: 'include' }),
			byCategory({ categories: ['Housing'], mode: 'include' })
		)

		const result = sampleTransactions.filter(combined)
		expect(result).toHaveLength(0)
	})

	it('byNOT should invert filter result', () => {
		const notExpense = byNOT(
			byTransactionType({ types: ['Expense'], mode: 'include' })
		)

		const result = sampleTransactions.filter(notExpense)
		expect(result).toHaveLength(3)
		expect(result.map((t) => t.id)).toEqual([2, 3, 5])
	})

	it('byAND with empty filters should pass all', () => {
		const combined = byAND()
		const result = sampleTransactions.filter(combined)
		expect(result).toHaveLength(5)
	})

	it('byOR with empty filters should pass none', () => {
		const combined = byOR()
		const result = sampleTransactions.filter(combined)
		expect(result).toHaveLength(0)
	})

	it('nested composition: byAND(byOR(...), byNOT(...))', () => {
		const combined = byAND(
			byOR(
				byCategory({ categories: ['Food'], mode: 'include' }),
				byCategory({ categories: ['Transport'], mode: 'include' })
			),
			byNOT(byTransactionType({ types: ['Refund'], mode: 'include' }))
		)

		const result = sampleTransactions.filter(combined)
		// Food: id 1 (Expense) + id 5 (Refund), Transport: id 4 (Expense)
		// NOT Refund removes id 5
		expect(result).toHaveLength(2)
		expect(result.map((t) => t.id)).toEqual([1, 4])
	})
})

describe('Filter type metadata', () => {
	it('byDateRange should have type byDateRange', () => {
		const f = byDateRange(new Date(2026, 0, 1), new Date(2026, 0, 31))
		expect(f.type).toBe('byDateRange')
	})

	it('byTransactionType should have type byTransactionType', () => {
		const f = byTransactionType({ types: ['Expense'], mode: 'include' })
		expect(f.type).toBe('byTransactionType')
	})

	it('byCategory should have type byCategory', () => {
		const f = byCategory({ categories: ['Food'], mode: 'include' })
		expect(f.type).toBe('byCategory')
	})

	it('byTags should have type byTags', () => {
		const f = byTags({
			category: 'Group',
			values: ['Friends'],
			mode: 'include',
		})
		expect(f.type).toBe('byTags')
	})

	it('byCurrency should have type byCurrency', () => {
		const f = byCurrency('THB')
		expect(f.type).toBe('byCurrency')
	})

	it('byTransfer should have type byTransfer', () => {
		const f = byTransfer('exclude')
		expect(f.type).toBe('byTransfer')
	})

	it('byAND should have type AND', () => {
		const f = byAND()
		expect(f.type).toBe('AND')
	})

	it('byOR should have type OR', () => {
		const f = byOR()
		expect(f.type).toBe('OR')
	})

	it('byNOT should have type NOT', () => {
		const f = byNOT(byCurrency('THB'))
		expect(f.type).toBe('NOT')
	})
})

describe('Filter chain order per RULES.md §2', () => {
	it('should apply filters in documented order: dateRange → transactionType → category → tags', () => {
		const result = filter(
			sampleTransactions,
			byDateRange(new Date(2026, 0, 1), new Date(2026, 1, 28)),
			byTransactionType({ types: ['Expense'], mode: 'include' }),
			byCategory({ categories: ['Food'], mode: 'include' }),
			byTags({
				category: 'Group',
				values: ['Friends'],
				mode: 'include',
			})
		)

		expect(result).toHaveLength(1)
		expect(result[0].id).toBe(1)
	})

	it('filter order should produce same result as sequential manual application', () => {
		let manual = [...sampleTransactions]
		const dateFilter = byDateRange(new Date(2026, 0, 1), new Date(2026, 1, 28))
		const typeFilter = byTransactionType({
			types: ['Expense', 'Income'],
			mode: 'include',
		})
		const catFilter = byCategory({
			categories: ['Food', 'Compensation'],
			mode: 'include',
		})

		manual = manual.filter(dateFilter)
		manual = manual.filter(typeFilter)
		manual = manual.filter(catFilter)

		const chained = filter(
			sampleTransactions,
			dateFilter,
			typeFilter,
			catFilter
		)

		expect(chained).toEqual(manual)
	})
})

describe('byDateRange filter', () => {
	it('should include transactions within date range', () => {
		const f = byDateRange(new Date(2026, 0, 1), new Date(2026, 0, 31))
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([1, 2])
	})

	it('should include transactions on boundary dates', () => {
		const f = byDateRange(new Date(2026, 0, 10), new Date(2026, 0, 20))
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([1, 2])
	})

	it('should exclude transactions outside date range', () => {
		const f = byDateRange(new Date(2026, 5, 1), new Date(2026, 5, 30))
		const result = sampleTransactions.filter(f)
		expect(result).toHaveLength(0)
	})
})

describe('byTags filter', () => {
	it('should include transactions with matching tag (include mode)', () => {
		const f = byTags({
			category: 'Group',
			values: ['Friends'],
			mode: 'include',
		})
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([1, 5])
	})

	it('should exclude transactions with matching tag (exclude mode)', () => {
		const f = byTags({
			category: 'Group',
			values: ['Friends'],
			mode: 'exclude',
		})
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([2, 3, 4])
	})

	it('multiple tag categories use AND logic per RULES.md', () => {
		const f = byTags(
			{ category: 'Group', values: ['Work'], mode: 'include' },
			{ category: 'Event', values: ['Conference'], mode: 'include' }
		)
		const result = sampleTransactions.filter(f)
		expect(result).toHaveLength(1)
		expect(result[0].id).toBe(4)
	})

	it('values inside one tag category use OR logic per RULES.md', () => {
		const f = byTags({
			category: 'Group',
			values: ['Friends', 'Work'],
			mode: 'include',
		})
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([1, 4, 5])
	})

	it('AND across categories: no match when one category fails', () => {
		const f = byTags(
			{ category: 'Group', values: ['Friends'], mode: 'include' },
			{ category: 'Event', values: ['Conference'], mode: 'include' }
		)
		const result = sampleTransactions.filter(f)
		expect(result).toHaveLength(0)
	})
})

describe('byTransactionType filter', () => {
	it('should include only specified types', () => {
		const f = byTransactionType({
			types: ['Expense'],
			mode: 'include',
		})
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([1, 4])
	})

	it('should exclude specified types', () => {
		const f = byTransactionType({
			types: ['Transfer'],
			mode: 'exclude',
		})
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([1, 2, 4, 5])
	})

	it('should support multiple types', () => {
		const f = byTransactionType({
			types: ['Income', 'Refund'],
			mode: 'include',
		})
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([2, 5])
	})
})

describe('byCurrency filter', () => {
	it('should filter by currency', () => {
		const f = byCurrency('THB')
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([1, 2, 3, 5])
	})

	it('should filter non-default currency', () => {
		const f = byCurrency('USD')
		const result = sampleTransactions.filter(f)
		expect(result.map((t) => t.id)).toEqual([4])
	})
})
