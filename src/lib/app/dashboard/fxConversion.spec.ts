import type { FxConversionBatch } from '$lib/app/controllers/currencyController.js'
import type { ParsedTransaction } from '$lib/transactions/models/index.js'
import { describe, expect, it } from 'vitest'

import { toLegacyFxConversionResult } from './fxConversion.js'

function parsedTransaction(
	id: number,
	currency: string = 'USD',
	amount: number = -10
): ParsedTransaction {
	return {
		id,
		type: 'Expense',
		account: {
			type: 'Wallet',
			name: 'Cash',
			extra: null,
		},
		description: 'Test',
		amount: {
			value: amount,
			currency,
		},
		date: new Date('2026-01-15'),
		memo: '',
		tags: [],
		raw: {},
		payee: 'Shop',
		category: {
			category: 'Food',
			subcategory: '',
		},
		checkNumber: '',
	}
}

describe('toLegacyFxConversionResult', () => {
	it('converts controller batches back into legacy parsed transaction results', () => {
		const parsedById = new Map<number, ParsedTransaction>([
			[1, parsedTransaction(1, 'THB', -100)],
			[2, parsedTransaction(2, 'USD', -10)],
			[3, parsedTransaction(3, 'EUR', -10)],
			[4, parsedTransaction(4, 'JPY', -10)],
		])
		const batch: FxConversionBatch = {
			entries: [
				{
					transactionId: 1,
					originalAmount: -100,
					originalCurrency: 'THB',
					convertedAmount: -100,
					method: 'base',
				},
				{
					transactionId: 2,
					originalAmount: -10,
					originalCurrency: 'USD',
					convertedAmount: -355,
					method: 'exact',
				},
				{
					transactionId: 3,
					originalAmount: -10,
					originalCurrency: 'EUR',
					convertedAmount: -380,
					method: 'estimated',
				},
				{
					transactionId: 4,
					originalAmount: -10,
					originalCurrency: 'JPY',
					convertedAmount: -10,
					method: 'unresolved',
				},
			],
			unresolvedCount: 1,
		}

		const result = toLegacyFxConversionResult(batch, parsedById)

		expect(result.transactions).toHaveLength(3)
		expect(
			result.transactions.map((transaction) => transaction.amount.currency)
		).toEqual(['THB', 'THB', 'THB'])
		expect(
			result.transactions.map((transaction) => transaction.amount.value)
		).toEqual([-100, -355, -380])
		expect(result.summary.convertedCount).toBe(3)
		expect(result.summary.exactCount).toBe(1)
		expect(result.summary.estimatedCount).toBe(1)
		expect(result.summary.unresolvedCount).toBe(1)
		expect(result.summary.unresolvedByCurrency).toEqual({ JPY: 1 })
	})
})
