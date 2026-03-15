import type { LedgerAccountBalanceRow } from '$lib/transactions/models'
import { describe, it, expect } from 'vitest'

import {
	isKcNtBalanceRow,
	filterKcNtAccountBalances,
	getKcNtAccountBalances,
} from './balance'

const mockRegularAccount: LedgerAccountBalanceRow = {
	accountId: 1,
	name: 'Regular Bank Account',
	entityId: 5,
	isArchived: false,
	openingBalance: 10000,
}

const mockKcNtAccount: LedgerAccountBalanceRow = {
	accountId: 2,
	name: 'KcNt Savings Account',
	entityId: 5,
	isArchived: false,
	openingBalance: 5000,
}

const mockKcNtCurrentAccount: LedgerAccountBalanceRow = {
	accountId: 3,
	name: 'My KcNt Current',
	entityId: 5,
	isArchived: false,
	openingBalance: 2000,
}

describe('isKcNtBalanceRow', () => {
	it('returns false for regular account', () => {
		expect(isKcNtBalanceRow(mockRegularAccount)).toBe(false)
	})

	it('returns true for account with KcNt in name', () => {
		expect(isKcNtBalanceRow(mockKcNtAccount)).toBe(true)
	})

	it('returns true for account with KcNt anywhere in name', () => {
		expect(isKcNtBalanceRow(mockKcNtCurrentAccount)).toBe(true)
	})

	it('handles null name gracefully', () => {
		const row: LedgerAccountBalanceRow = {
			accountId: 4,
			name: '',
			entityId: 5,
			isArchived: false,
			openingBalance: 0,
		}
		expect(isKcNtBalanceRow(row)).toBe(false)
	})
})

describe('filterKcNtAccountBalances', () => {
	it('filters out KcNt accounts', () => {
		const balances = [
			mockRegularAccount,
			mockKcNtAccount,
			mockKcNtCurrentAccount,
		]
		const filtered = filterKcNtAccountBalances(balances)
		expect(filtered).toHaveLength(1)
		expect(filtered[0]).toEqual(mockRegularAccount)
	})

	it('keeps non-KcNt accounts', () => {
		const balances = [mockRegularAccount]
		const filtered = filterKcNtAccountBalances(balances)
		expect(filtered).toEqual(balances)
	})

	it('handles empty array', () => {
		const filtered = filterKcNtAccountBalances([])
		expect(filtered).toEqual([])
	})

	it('returns empty when all accounts are KcNt', () => {
		const balances = [mockKcNtAccount, mockKcNtCurrentAccount]
		const filtered = filterKcNtAccountBalances(balances)
		expect(filtered).toHaveLength(0)
	})

	it('handles all non-KcNt accounts', () => {
		const account1: LedgerAccountBalanceRow = {
			...mockRegularAccount,
			accountId: 10,
		}
		const account2: LedgerAccountBalanceRow = {
			...mockRegularAccount,
			accountId: 11,
			name: 'Another Regular',
		}
		const balances = [account1, account2]
		const filtered = filterKcNtAccountBalances(balances)
		expect(filtered).toEqual(balances)
	})
})

describe('getKcNtAccountBalances', () => {
	it('returns only KcNt accounts', () => {
		const balances = [
			mockRegularAccount,
			mockKcNtAccount,
			mockKcNtCurrentAccount,
		]
		const kcnt = getKcNtAccountBalances(balances)
		expect(kcnt).toHaveLength(2)
		expect(kcnt).toContainEqual(mockKcNtAccount)
		expect(kcnt).toContainEqual(mockKcNtCurrentAccount)
	})

	it('returns empty when no KcNt accounts', () => {
		const balances = [mockRegularAccount]
		const kcnt = getKcNtAccountBalances(balances)
		expect(kcnt).toHaveLength(0)
	})

	it('handles empty array', () => {
		const kcnt = getKcNtAccountBalances([])
		expect(kcnt).toEqual([])
	})

	it('returns all when all accounts are KcNt', () => {
		const balances = [mockKcNtAccount, mockKcNtCurrentAccount]
		const kcnt = getKcNtAccountBalances(balances)
		expect(kcnt).toEqual(balances)
	})
})
