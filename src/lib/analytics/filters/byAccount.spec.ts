import type { FilterAccount } from './models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, it, expect } from 'vitest'

import { byAccount } from './byAccount'

describe('byAccount filter', () => {
	const createExpense = (accountName: string): ParsedTransaction => ({
		type: 'Expense',
		id: 1,
		account: { type: 'Checking', name: accountName, extra: null },
		description: 'Test',
		amount: { value: -100, currency: 'THB' },
		date: new Date(),
		memo: '',
		tags: [],
		raw: {},
		payee: 'Store',
		category: { category: 'Food', subcategory: 'Restaurant' },
		checkNumber: '',
	})

	it('should filter transactions by account name', () => {
		const filter: FilterAccount = {
			accounts: ['Main Account', 'Savings'],
		}

		const by = byAccount(filter)

		const matchingTrx = createExpense('Main Account')
		const nonMatchingTrx = createExpense('Other Account')

		expect(by(matchingTrx)).toBe(true)
		expect(by(nonMatchingTrx)).toBe(false)
	})

	it('should return false for transactions without account', () => {
		const filter: FilterAccount = {
			accounts: ['Main Account'],
		}

		const by = byAccount(filter)

		// Create a transaction and then remove the account property to test the guard
		const trxWithoutAccount: any = createExpense('Main Account')
		delete trxWithoutAccount.account

		expect(by(trxWithoutAccount)).toBe(false)
	})

	it('should have correct filter type', () => {
		const filter: FilterAccount = {
			accounts: ['Main Account'],
		}

		const by = byAccount(filter)
		expect(by.type).toBe('byAccount')
	})
})
