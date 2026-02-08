import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, it, expect } from 'vitest'

import { byCategory } from './byCategory'
import { bySpecialCategory } from './bySpecialCategory'
import { byTransfer } from './byTransfer'

const createExpense = (
	category: string,
	subcategory: string
): ParsedTransaction => ({
	type: 'Expense',
	id: 1,
	account: { type: 'Checking', name: 'Test', extra: null },
	description: 'Test',
	amount: { value: -100, currency: 'THB' },
	date: new Date(),
	memo: '',
	tags: [],
	raw: {},
	payee: 'Test',
	category: { category, subcategory },
	checkNumber: '',
})

const createTransfer = (): ParsedTransaction => ({
	type: 'Transfer',
	id: 2,
	account: { type: 'Checking', name: 'From', extra: null },
	description: 'Transfer',
	amount: { value: -500, currency: 'THB' },
	date: new Date(),
	memo: '',
	tags: [],
	raw: {},
	transfer: { type: 'Checking', name: 'To', extra: null },
})

describe('byCategory filter', () => {
	it('should include transactions matching category in include mode', () => {
		const filter = byCategory({ categories: ['Food'], mode: 'include' })
		const expense = createExpense('Food', 'Restaurant')

		expect(filter(expense)).toBe(true)
	})

	it('should include transactions matching parent category', () => {
		const filter = byCategory({ categories: ['Food'], mode: 'include' })
		const expense = createExpense('Food', 'Groceries')

		expect(filter(expense)).toBe(true)
	})

	it('should exclude transactions not matching category in include mode', () => {
		const filter = byCategory({ categories: ['Food'], mode: 'include' })
		const expense = createExpense('Transport', 'Taxi')

		expect(filter(expense)).toBe(false)
	})

	it('should exclude transactions matching category in exclude mode', () => {
		const filter = byCategory({ categories: ['Food'], mode: 'exclude' })
		const expense = createExpense('Food', 'Restaurant')

		expect(filter(expense)).toBe(false)
	})

	it('should include transactions not matching category in exclude mode', () => {
		const filter = byCategory({ categories: ['Food'], mode: 'exclude' })
		const expense = createExpense('Transport', 'Taxi')

		expect(filter(expense)).toBe(true)
	})
})

describe('byTransfer filter', () => {
	it('should exclude transfers in exclude mode', () => {
		const filter = byTransfer('exclude')

		expect(filter(createTransfer())).toBe(false)
		expect(filter(createExpense('Food', 'Restaurant'))).toBe(true)
	})

	it('should only keep transfers in only mode', () => {
		const filter = byTransfer('only')

		expect(filter(createTransfer())).toBe(true)
		expect(filter(createExpense('Food', 'Restaurant'))).toBe(false)
	})
})

describe('bySpecialCategory filter', () => {
	it('should exclude special categories in exclude-all mode', () => {
		const filter = bySpecialCategory('exclude-all')

		expect(filter(createExpense('Payment', 'Debt'))).toBe(false)
		expect(filter(createExpense('Payment', 'Giveaways'))).toBe(false)
		expect(filter(createExpense('Food', 'Restaurant'))).toBe(true)
	})

	it('should only keep debt in only-debt mode', () => {
		const filter = bySpecialCategory('only-debt')

		expect(filter(createExpense('Payment', 'Debt'))).toBe(true)
		expect(filter(createExpense('Payment', 'Debt Repayment'))).toBe(true)
		expect(filter(createExpense('Payment', 'Giveaways'))).toBe(false)
	})

	it('should only keep gifts in only-gift mode', () => {
		const filter = bySpecialCategory('only-gift')

		expect(filter(createExpense('Payment', 'Giveaways'))).toBe(true)
		expect(filter(createExpense('Payment', 'Windfall'))).toBe(true)
		expect(filter(createExpense('Payment', 'Debt'))).toBe(false)
	})
})
