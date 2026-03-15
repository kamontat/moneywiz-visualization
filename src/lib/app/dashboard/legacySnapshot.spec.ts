import type { DataTransaction } from '$lib/apis/record/transactions/types'
import { describe, expect, it } from 'vitest'

import { toParsedTransaction } from './legacySnapshot'

function tx(
	overrides: Partial<DataTransaction> & {
		id: number
		type: DataTransaction['type']
	}
): DataTransaction {
	const { id, type, ...rest } = overrides

	return {
		id,
		type,
		date: new Date('2026-01-15'),
		amount: -100,
		currency: 'THB',
		category: 'Food',
		subcategory: 'Dining',
		payee: 'Restaurant',
		accountId: 1,
		accountName: 'Wallet',
		notes: 'Lunch',
		tags: [],
		...rest,
	}
}

describe('toParsedTransaction', () => {
	it('maps category-based transactions to legacy expense records', () => {
		const parsed = toParsedTransaction(tx({ id: 1, type: 'expense' }))

		expect(parsed.type).toBe('Expense')
		expect(parsed.account.name).toBe('Wallet')
		expect(parsed.amount.value).toBe(-100)
		expect('category' in parsed && parsed.category.category).toBe('Food')
	})

	it('maps transfers with a legacy transfer account field', () => {
		const parsed = toParsedTransaction(
			tx({ id: 2, type: 'transfer', category: '', subcategory: '' })
		)

		expect(parsed.type).toBe('Transfer')
		expect('transfer' in parsed && parsed.transfer.name).toBe('Wallet')
	})

	it('maps debt repayment naming to the legacy transaction type', () => {
		const parsed = toParsedTransaction(tx({ id: 3, type: 'debt_repayment' }))

		expect(parsed.type).toBe('DebtRepayment')
	})
})
