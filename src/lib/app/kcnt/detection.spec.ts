import type { ParsedAccount } from '$lib/transactions/models/account'
import type { ParsedAmount } from '$lib/transactions/models/amount'
import type { ParsedCategory } from '$lib/transactions/models/category'
import type { ParsedTag } from '$lib/transactions/models/tag'
import type {
	ParsedExpenseTransaction,
	ParsedTransferTransaction,
} from '$lib/transactions/models/transaction'
import { describe, it, expect } from 'vitest'

import {
	hasKcNtTag,
	isKcNtAccount,
	isKcNtTransaction,
	isKcNtToKcNtTransfer,
} from './detection'

const createAmount = (): ParsedAmount => ({
	value: 100,
	currency: 'USD',
})

const createCategory = (): ParsedCategory => ({
	category: 'Test',
	subcategory: 'Test',
})

const createAccount = (extra?: string | null): ParsedAccount => ({
	type: 'Checking',
	name: 'Test Account',
	extra: extra ?? null,
})

const createExpenseTransaction = (
	tags: ParsedTag[]
): ParsedExpenseTransaction => ({
	type: 'Expense',
	account: createAccount(),
	description: 'Test expense',
	amount: createAmount(),
	date: new Date(),
	memo: '',
	tags,
	raw: {},
	payee: 'Test Payee',
	category: createCategory(),
	checkNumber: '',
})

const createTransferTransaction = (
	account: ParsedAccount,
	transfer: ParsedAccount,
	tags: ParsedTag[] = []
): ParsedTransferTransaction => ({
	type: 'Transfer',
	account,
	transfer,
	description: 'Transfer',
	amount: createAmount(),
	date: new Date(),
	memo: '',
	tags,
	raw: {},
})

describe('hasKcNtTag', () => {
	it('returns false for empty array', () => {
		expect(hasKcNtTag([])).toBe(false)
	})

	it('returns false for non-matching tags', () => {
		const tags: ParsedTag[] = [
			{ category: 'Other', name: 'Tag1' },
			{ category: 'Group', name: 'Other' },
		]
		expect(hasKcNtTag(tags)).toBe(false)
	})

	it('returns true for matching Group:KcNt tag', () => {
		const tags: ParsedTag[] = [
			{ category: 'Other', name: 'Tag1' },
			{ category: 'Group', name: 'KcNt' },
		]
		expect(hasKcNtTag(tags)).toBe(true)
	})
})

describe('isKcNtAccount', () => {
	it('returns false for null account', () => {
		expect(isKcNtAccount(null)).toBe(false)
	})

	it('returns false for undefined account', () => {
		expect(isKcNtAccount(undefined)).toBe(false)
	})

	it('returns false when extra is null', () => {
		const account = createAccount(null)
		expect(isKcNtAccount(account)).toBe(false)
	})

	it('returns false when extra does not contain KcNt', () => {
		const account = createAccount('OtherMarker')
		expect(isKcNtAccount(account)).toBe(false)
	})

	it('returns true when extra contains KcNt', () => {
		const account = createAccount('KcNt')
		expect(isKcNtAccount(account)).toBe(true)
	})

	it('returns true when KcNt is part of a longer extra string', () => {
		const account = createAccount('Some KcNt Extra')
		expect(isKcNtAccount(account)).toBe(true)
	})
})

describe('isKcNtTransaction', () => {
	it('returns false for transaction without KcNt tag', () => {
		const tx = createExpenseTransaction([{ category: 'Other', name: 'Tag' }])
		expect(isKcNtTransaction(tx)).toBe(false)
	})

	it('returns true for transaction with KcNt tag', () => {
		const tx = createExpenseTransaction([{ category: 'Group', name: 'KcNt' }])
		expect(isKcNtTransaction(tx)).toBe(true)
	})
})

describe('isKcNtToKcNtTransfer', () => {
	it('returns false for non-transfer transaction', () => {
		const tx = createExpenseTransaction([])
		expect(isKcNtToKcNtTransfer(tx)).toBe(false)
	})

	it('returns false for transfer with one KcNt account', () => {
		const kcntAccount = createAccount('KcNt')
		const regularAccount = createAccount()
		const tx = createTransferTransaction(kcntAccount, regularAccount)
		expect(isKcNtToKcNtTransfer(tx)).toBe(false)
	})

	it('returns false for transfer with no KcNt accounts', () => {
		const account1 = createAccount()
		const account2 = createAccount('Other')
		const tx = createTransferTransaction(account1, account2)
		expect(isKcNtToKcNtTransfer(tx)).toBe(false)
	})

	it('returns true for transfer between two KcNt accounts', () => {
		const kcntAccount1 = createAccount('KcNt')
		const kcntAccount2 = createAccount('KcNt-Savings')
		const tx = createTransferTransaction(kcntAccount1, kcntAccount2)
		expect(isKcNtToKcNtTransfer(tx)).toBe(true)
	})
})
