import type {
	ParsedAccount,
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedTransaction,
	ParsedTransferTransaction,
} from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import {
	reclassifyForKcNtMode,
	reclassifyTransactionsForKcNtMode,
} from './reclassify'

const checkingAccount = (
	name: string,
	extra: string | null = null
): ParsedAccount => ({
	type: 'Checking',
	name,
	extra,
})

const baseTransfer = (): ParsedTransferTransaction => ({
	id: 1,
	type: 'Transfer',
	account: checkingAccount('My Bank'),
	transfer: checkingAccount('Other Bank'),
	amount: { value: -100, currency: 'THB' },
	date: new Date('2024-01-01T00:00:00Z'),
	description: 'Test transfer',
	memo: '',
	tags: [],
	raw: {},
})

const kcntAccount = checkingAccount('KcNt Account', 'KcNt')

describe('reclassifyForKcNtMode', () => {
	it('passes through non-transfer transactions', () => {
		const incomeTx: ParsedTransaction = {
			id: 2,
			type: 'Income',
			account: checkingAccount('My Bank'),
			description: 'Income',
			amount: { value: 100, currency: 'THB' },
			date: new Date('2024-01-02T00:00:00Z'),
			memo: '',
			tags: [],
			raw: {},
			payee: 'Employer',
			category: { category: 'Salary', subcategory: '' },
			checkNumber: '',
		}

		const result = reclassifyForKcNtMode(incomeTx, { kcntModeEnabled: false })
		expect(result).toBe(incomeTx)
	})

	it('passes through transfer with no KcNt accounts', () => {
		const transfer = baseTransfer()
		const result = reclassifyForKcNtMode(transfer, { kcntModeEnabled: false })
		expect(result).toBe(transfer)
	})

	it('reclassifies transfer TO KcNt as Expense', () => {
		const transfer = { ...baseTransfer(), transfer: kcntAccount }
		const result = reclassifyForKcNtMode(transfer, { kcntModeEnabled: false })
		if (result.type !== 'Expense') throw new Error('expected expense')
		expect((result as ParsedExpenseTransaction).payee).toBe('KcNt Account')
		expect((result as ParsedExpenseTransaction).category).toEqual({
			category: 'Transfer',
			subcategory: '',
		})
		expect((result as ParsedExpenseTransaction).checkNumber).toBe('')
		expect(result).not.toBe(transfer)
	})

	it('reclassifies transfer FROM KcNt as Income', () => {
		const transfer = { ...baseTransfer(), account: kcntAccount }
		const result = reclassifyForKcNtMode(transfer, { kcntModeEnabled: false })
		if (result.type !== 'Income') throw new Error('expected income')
		expect((result as ParsedIncomeTransaction).payee).toBe('KcNt Account')
		expect((result as ParsedIncomeTransaction).category).toEqual({
			category: 'Transfer',
			subcategory: '',
		})
		expect((result as ParsedIncomeTransaction).checkNumber).toBe('')
		expect(result).not.toBe(transfer)
	})

	it('passes through transfer between two KcNt accounts', () => {
		const transfer = {
			...baseTransfer(),
			account: kcntAccount,
			transfer: kcntAccount,
		}
		const result = reclassifyForKcNtMode(transfer, { kcntModeEnabled: false })
		expect(result).toBe(transfer)
	})

	it('respects kcntModeEnabled by only reclassifying tagged transfers', () => {
		const transfer = { ...baseTransfer(), transfer: kcntAccount }
		const taggedTransfer: ParsedTransferTransaction = {
			...transfer,
			tags: [{ category: 'Group', name: 'KcNt' }],
		}

		const resultWhenEnabled = reclassifyForKcNtMode(taggedTransfer, {
			kcntModeEnabled: true,
		})
		expect(resultWhenEnabled.type).toBe('Expense')

		const resultWhenEnabledButUntagged = reclassifyForKcNtMode(transfer, {
			kcntModeEnabled: true,
		})
		expect(resultWhenEnabledButUntagged).toBe(transfer)
	})
})

describe('reclassifyTransactionsForKcNtMode', () => {
	it('maps array of transactions', () => {
		const txs: ParsedTransaction[] = [
			baseTransfer(),
			{ ...baseTransfer(), transfer: kcntAccount },
		]
		const result = reclassifyTransactionsForKcNtMode(txs, {
			kcntModeEnabled: false,
		})
		expect(result).toHaveLength(2)
		expect(result[0]).toBe(txs[0])
		expect(result[1].type).toBe('Expense')
	})
})
