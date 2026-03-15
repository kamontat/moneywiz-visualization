import type { DataAccounts } from '$lib/apis/record/accounts/types'
import type {
	DataTransaction,
	DataTransactions,
} from '$lib/apis/record/transactions/types'
import type { RecordApiV1 } from '$lib/apis/record/v1'
import type { FilterState } from '$lib/app/sessions/types'
import { describe, expect, it, beforeEach } from 'vitest'

import { createDataController, type DataController } from './dataController'

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

const EMPTY_FILTER: FilterState = {
	transactionTypes: [],
	transactionTypeMode: 'include',
	categories: [],
	categoryMode: 'include',
	payees: [],
	accounts: [],
	tags: [],
}

function createMockRecordApi(
	transactions: DataTransaction[],
	accounts: DataAccounts['accounts'] = []
): RecordApiV1 {
	return {
		name: 'record',
		version: 1,
		async getTransactions(): Promise<DataTransactions> {
			return { name: 'transactions', type: 'record', transactions }
		},
		async getAccounts(): Promise<DataAccounts> {
			return { name: 'accounts', type: 'record', accounts }
		},
	}
}

describe('DataController', () => {
	const sampleTx = [
		tx({
			id: 1,
			type: 'income',
			amount: 1000,
			category: 'Salary',
			payee: 'Employer',
			date: new Date('2026-01-01'),
		}),
		tx({
			id: 2,
			type: 'expense',
			amount: -200,
			category: 'Food',
			payee: 'Restaurant',
			date: new Date('2026-01-10'),
		}),
		tx({
			id: 3,
			type: 'expense',
			amount: -150,
			category: 'Transport',
			payee: 'BTS',
			date: new Date('2026-02-05'),
			accountId: 2,
			accountName: 'Credit Card',
		}),
		tx({
			id: 4,
			type: 'transfer',
			amount: -500,
			category: '',
			payee: '',
			date: new Date('2026-03-01'),
		}),
	]

	const sampleAccounts: DataAccounts['accounts'] = [
		{ id: 1, name: 'Wallet', currency: 'THB', type: 'wallet' },
		{ id: 2, name: 'Credit Card', currency: 'THB', type: 'creditcard' },
	]

	let ctrl: DataController

	beforeEach(async () => {
		ctrl = createDataController(createMockRecordApi(sampleTx, sampleAccounts))
		await ctrl.loadAll()
	})

	it('loads all transactions', () => {
		expect(ctrl.getAllTransactions()).toHaveLength(4)
	})

	it('loads all accounts', () => {
		expect(ctrl.getAllAccounts()).toHaveLength(2)
	})

	describe('getTransactions', () => {
		it('returns all when no filters', () => {
			const result = ctrl.getTransactions(EMPTY_FILTER)
			expect(result).toHaveLength(4)
		})

		it('filters by date range', () => {
			const result = ctrl.getTransactions({
				...EMPTY_FILTER,
				dateRange: {
					start: new Date('2026-01-01'),
					end: new Date('2026-01-31'),
				},
			})
			expect(result.map((t) => t.id)).toEqual([1, 2])
		})

		it('filters by transaction type', () => {
			const result = ctrl.getTransactions({
				...EMPTY_FILTER,
				transactionTypes: ['expense'],
			})
			expect(result.map((t) => t.id)).toEqual([2, 3])
		})

		it('excludes transaction types when configured', () => {
			const result = ctrl.getTransactions({
				...EMPTY_FILTER,
				transactionTypes: ['expense'],
				transactionTypeMode: 'exclude',
			})
			expect(result.map((t) => t.id)).toEqual([1, 4])
		})

		it('filters by category', () => {
			const result = ctrl.getTransactions({
				...EMPTY_FILTER,
				categories: ['Food'],
			})
			expect(result.map((t) => t.id)).toEqual([2])
		})

		it('excludes categories when configured', () => {
			const result = ctrl.getTransactions({
				...EMPTY_FILTER,
				categories: ['Food'],
				categoryMode: 'exclude',
			})
			expect(result.map((t) => t.id)).toEqual([1, 3, 4])
		})

		it('filters by payee', () => {
			const result = ctrl.getTransactions({
				...EMPTY_FILTER,
				payees: ['BTS'],
			})
			expect(result.map((t) => t.id)).toEqual([3])
		})

		it('filters by account', () => {
			const result = ctrl.getTransactions({
				...EMPTY_FILTER,
				accounts: [2],
			})
			expect(result.map((t) => t.id)).toEqual([3])
		})

		it('filters tags using include and exclude modes', async () => {
			const taggedController = createDataController(
				createMockRecordApi([
					tx({
						id: 10,
						tags: [{ category: 'Priority', name: 'High' }],
					}),
					tx({
						id: 11,
						tags: [{ category: 'Priority', name: 'Low' }],
					}),
					tx({ id: 12, tags: [] }),
				])
			)
			await taggedController.loadAll()

			expect(
				taggedController
					.getTransactions({
						...EMPTY_FILTER,
						tags: [{ category: 'Priority', values: ['High'], mode: 'include' }],
					})
					.map((t) => t.id)
			).toEqual([10])

			expect(
				taggedController
					.getTransactions({
						...EMPTY_FILTER,
						tags: [{ category: 'Priority', values: ['High'], mode: 'exclude' }],
					})
					.map((t) => t.id)
			).toEqual([11, 12])
		})

		it('combines multiple filters', () => {
			const result = ctrl.getTransactions({
				...EMPTY_FILTER,
				transactionTypes: ['expense'],
				dateRange: {
					start: new Date('2026-02-01'),
					end: new Date('2026-02-28'),
				},
			})
			expect(result.map((t) => t.id)).toEqual([3])
		})
	})

	describe('getAnalytics', () => {
		it('computes totals for all transactions', () => {
			const analytics = ctrl.getAnalytics(EMPTY_FILTER)
			expect(analytics.income).toBe(1000)
			expect(analytics.expense).toBe(-350)
			expect(analytics.net).toBe(650)
			expect(analytics.transactionCount).toBe(4)
		})

		it('computes analytics for filtered subset', () => {
			const analytics = ctrl.getAnalytics({
				...EMPTY_FILTER,
				transactionTypes: ['expense'],
			})
			expect(analytics.income).toBe(0)
			expect(analytics.expense).toBe(-350)
			expect(analytics.net).toBe(-350)
			expect(analytics.transactionCount).toBe(2)
		})

		it('returns zero savings rate when no income', () => {
			const analytics = ctrl.getAnalytics({
				...EMPTY_FILTER,
				transactionTypes: ['expense'],
			})
			expect(analytics.savingsRate).toBe(0)
		})
	})

	describe('getAvailableOptions', () => {
		it('returns unique categories', () => {
			const options = ctrl.getAvailableOptions(EMPTY_FILTER)
			expect(options.categories).toContain('Food')
			expect(options.categories).toContain('Salary')
			expect(options.categories).toContain('Transport')
		})

		it('returns unique payees excluding empty', () => {
			const options = ctrl.getAvailableOptions(EMPTY_FILTER)
			expect(options.payees).not.toContain('')
			expect(options.payees).toContain('Restaurant')
		})

		it('returns matching accounts from cache', () => {
			const options = ctrl.getAvailableOptions(EMPTY_FILTER)
			expect(options.accounts).toHaveLength(2)
			expect(options.accounts.map((a) => a.name)).toContain('Wallet')
		})

		it('returns date range', () => {
			const options = ctrl.getAvailableOptions(EMPTY_FILTER)
			expect(options.dateRange).toBeDefined()
			expect(options.dateRange!.start.getTime()).toBe(
				new Date('2026-01-01').getTime()
			)
			expect(options.dateRange!.end.getTime()).toBe(
				new Date('2026-03-01').getTime()
			)
		})

		it('scopes options to filtered subset', () => {
			const options = ctrl.getAvailableOptions({
				...EMPTY_FILTER,
				transactionTypes: ['expense'],
			})
			expect(options.categories).not.toContain('Salary')
			expect(options.transactionTypes).toEqual(['expense'])
		})
	})
})
