import type { ParsedTransactionType } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { formatTransactionType } from './transactionType'

describe('formatTransactionType', () => {
	it('should format single-word transaction types', () => {
		expect(formatTransactionType('Expense')).toBe('Expense')
		expect(formatTransactionType('Refund')).toBe('Refund')
		expect(formatTransactionType('Reconcile')).toBe('Reconcile')
	})

	it('should format PascalCase transaction types', () => {
		expect(formatTransactionType('DebtRepayment')).toBe('Debt Repayment')
	})

	it('should format all known transaction types without empty output', () => {
		const allTypes: ParsedTransactionType[] = [
			'Buy',
			'Debt',
			'DebtRepayment',
			'Expense',
			'Giveaway',
			'Income',
			'Reconcile',
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
