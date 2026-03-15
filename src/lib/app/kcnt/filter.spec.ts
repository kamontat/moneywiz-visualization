import type {
	ParsedExpenseTransaction,
	ParsedTransferTransaction,
} from '$lib/transactions/models/transaction'
import { describe, it, expect } from 'vitest'

import { filterByKcNtMode, byKcNtMode } from './filter'

const mockKcNtTagged: ParsedExpenseTransaction = {
	id: 1,
	type: 'Expense',
	account: { type: 'Checking', name: 'Bank', extra: null },
	amount: { value: -100, currency: 'THB' },
	date: new Date(),
	description: 'Test',
	memo: '',
	tags: [{ category: 'Group', name: 'KcNt' }],
	raw: {},
	payee: 'Test',
	category: { category: 'Food', subcategory: '' },
	checkNumber: '',
}

const mockNonKcNt: ParsedExpenseTransaction = {
	id: 2,
	type: 'Expense',
	account: { type: 'Checking', name: 'Bank', extra: null },
	amount: { value: -100, currency: 'THB' },
	date: new Date(),
	description: 'Test',
	memo: '',
	tags: [{ category: 'Other', name: 'SomeTag' }],
	raw: {},
	payee: 'Test',
	category: { category: 'Food', subcategory: '' },
	checkNumber: '',
}

const mockKcNtToKcNtTransfer: ParsedTransferTransaction = {
	id: 3,
	type: 'Transfer',
	account: { type: 'Checking', name: 'KcNt Bank 1', extra: 'KcNt' },
	transfer: { type: 'Checking', name: 'KcNt Bank 2', extra: 'KcNt' },
	amount: { value: -100, currency: 'THB' },
	date: new Date(),
	description: 'Internal transfer',
	memo: '',
	tags: [{ category: 'Group', name: 'KcNt' }],
	raw: {},
}

const mockRegularTransfer: ParsedTransferTransaction = {
	id: 4,
	type: 'Transfer',
	account: { type: 'Checking', name: 'Bank 1', extra: null },
	transfer: { type: 'Checking', name: 'Bank 2', extra: null },
	amount: { value: -100, currency: 'THB' },
	date: new Date(),
	description: 'Regular transfer',
	memo: '',
	tags: [],
	raw: {},
}

describe('filterByKcNtMode', () => {
	describe('Default mode (kcntModeEnabled = false)', () => {
		it('should keep non-KcNt transactions', () => {
			const transactions = [mockNonKcNt]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: false })
			expect(result).toHaveLength(1)
			expect(result[0].id).toBe(2)
		})

		it('should keep KcNt-tagged transactions for reclassification', () => {
			const transactions = [mockKcNtTagged]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: false })
			expect(result).toHaveLength(1)
			expect(result[0].id).toBe(1)
		})

		it('should exclude KcNt-to-KcNt transfers', () => {
			const transactions = [mockKcNtToKcNtTransfer]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: false })
			expect(result).toHaveLength(0)
		})

		it('should keep regular transfers', () => {
			const transactions = [mockRegularTransfer]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: false })
			expect(result).toHaveLength(1)
			expect(result[0].id).toBe(4)
		})

		it('should filter mixed transaction list correctly', () => {
			const transactions = [
				mockNonKcNt,
				mockKcNtTagged,
				mockKcNtToKcNtTransfer,
				mockRegularTransfer,
			]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: false })
			expect(result).toHaveLength(3)
			expect(result.map((t) => t.id)).toEqual([2, 1, 4])
		})
	})

	describe('KcNt mode (kcntModeEnabled = true)', () => {
		it('should only keep KcNt-tagged transactions', () => {
			const transactions = [mockKcNtTagged, mockNonKcNt]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: true })
			expect(result).toHaveLength(1)
			expect(result[0].id).toBe(1)
		})

		it('should exclude non-KcNt transactions', () => {
			const transactions = [mockNonKcNt]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: true })
			expect(result).toHaveLength(0)
		})

		it('should exclude KcNt-to-KcNt transfers even if tagged', () => {
			const transactions = [mockKcNtToKcNtTransfer]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: true })
			expect(result).toHaveLength(0)
		})

		it('should exclude regular transfers', () => {
			const transactions = [mockRegularTransfer]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: true })
			expect(result).toHaveLength(0)
		})

		it('should filter mixed transaction list correctly', () => {
			const transactions = [
				mockNonKcNt,
				mockKcNtTagged,
				mockKcNtToKcNtTransfer,
				mockRegularTransfer,
			]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: true })
			expect(result).toHaveLength(1)
			expect(result[0].id).toBe(1)
		})
	})

	describe('byKcNtMode function', () => {
		it('should return a filter function that works in default mode', () => {
			const filterFn = byKcNtMode({ kcntModeEnabled: false })
			const transactions = [mockKcNtTagged, mockNonKcNt, mockKcNtToKcNtTransfer]
			const result = filterFn(transactions)
			expect(result).toHaveLength(2)
			expect(result.map((t) => t.id)).toEqual([1, 2])
		})

		it('should return a filter function that works in KcNt mode', () => {
			const filterFn = byKcNtMode({ kcntModeEnabled: true })
			const transactions = [mockKcNtTagged, mockNonKcNt, mockKcNtToKcNtTransfer]
			const result = filterFn(transactions)
			expect(result).toHaveLength(1)
			expect(result[0].id).toBe(1)
		})
	})

	describe('Edge cases', () => {
		it('should handle empty transaction list', () => {
			const result = filterByKcNtMode([], { kcntModeEnabled: false })
			expect(result).toHaveLength(0)
		})

		it('should handle empty transaction list in KcNt mode', () => {
			const result = filterByKcNtMode([], { kcntModeEnabled: true })
			expect(result).toHaveLength(0)
		})

		it('should preserve transaction order', () => {
			const transactions = [mockRegularTransfer, mockNonKcNt, mockKcNtTagged]
			const result = filterByKcNtMode(transactions, { kcntModeEnabled: false })
			expect(result.map((t) => t.id)).toEqual([4, 2, 1])
		})
	})
})
