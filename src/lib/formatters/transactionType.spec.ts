import type { ParsedTransactionType } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { formatTransactionType } from './transactionType'

describe('formatTransactionType', () => {
	it('should format single-word transaction types', () => {
		expect(formatTransactionType('Expense')).toBe('Expense')
		expect(formatTransactionType('Refund')).toBe('Refund')
	})

	it('should format PascalCase transaction types', () => {
		expect(formatTransactionType('DebtRepayment')).toBe('Debt Repayment')
		expect(formatTransactionType('NewBalance')).toBe('New Balance')
	})

	it('should format all known transaction types without empty output', () => {
		const allTypes: ParsedTransactionType[] = [
			'Buy',
			'Debt',
			'DebtRepayment',
			'Expense',
			'Giveaway',
			'Income',
			'NewBalance',
			'Refund',
			'Sell',
			'Transfer',
			'Unknown',
			'Windfall',
		]

		for (const type of allTypes) {
			expect(formatTransactionType(type).length).toBeGreaterThan(0)
		}
	})
})
