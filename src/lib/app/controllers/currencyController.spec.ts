import type { DataTransaction } from '$lib/apis/record/transactions/types.js'
import type { FxRateTable } from '$lib/currency/models/index.js'
import { describe, expect, it } from 'vitest'

import { createCurrencyController } from './currencyController.js'

function tx(
	overrides: Partial<DataTransaction> & { id: number }
): DataTransaction {
	return {
		type: 'expense',
		date: new Date('2026-01-15'),
		amount: -100,
		currency: 'THB',
		category: 'Food',
		subcategory: '',
		payee: 'Test',
		accountId: 1,
		accountName: 'Wallet',
		notes: '',
		tags: [],
		...overrides,
	} as DataTransaction
}

describe('CurrencyController', () => {
	const ctrl = createCurrencyController()

	describe('convert', () => {
		const rateTable: FxRateTable = {
			baseCurrency: 'THB',
			rates: {
				USD: { '2026-01-15': 35.5, '2026-01-10': 35.0 },
				EUR: { '2026-01-14': 38.0 },
			},
		}

		it('passes THB transactions through as base', () => {
			const transactions = [tx({ id: 1, amount: -500, currency: 'THB' })]
			const result = ctrl.convert(transactions, rateTable)
			expect(result.entries).toHaveLength(1)
			expect(result.entries[0].method).toBe('base')
			expect(result.entries[0].convertedAmount).toBe(-500)
			expect(result.unresolvedCount).toBe(0)
		})

		it('converts foreign currency using rate table', () => {
			const transactions = [tx({ id: 1, amount: -10, currency: 'USD' })]
			const result = ctrl.convert(transactions, rateTable)
			expect(result.entries).toHaveLength(1)
			expect(result.entries[0].method).toBe('exact')
			expect(result.entries[0].convertedAmount).toBe(-355)
		})

		it('uses nearest earlier date for rate lookup', () => {
			const transactions = [
				tx({
					id: 1,
					amount: -10,
					currency: 'EUR',
					date: new Date('2026-01-15'),
				}),
			]
			const result = ctrl.convert(transactions, rateTable)
			expect(result.entries[0].method).toBe('estimated')
			expect(result.entries[0].convertedAmount).toBe(-380)
		})

		it('marks unresolved when no rate exists', () => {
			const transactions = [tx({ id: 1, amount: -10, currency: 'JPY' })]
			const result = ctrl.convert(transactions, rateTable)
			expect(result.entries).toHaveLength(1)
			expect(result.entries[0].method).toBe('unresolved')
			expect(result.unresolvedCount).toBe(1)
		})

		it('marks unresolved when date is before all rates', () => {
			const transactions = [
				tx({
					id: 1,
					amount: -10,
					currency: 'EUR',
					date: new Date('2025-12-01'),
				}),
			]
			const result = ctrl.convert(transactions, rateTable)
			expect(result.entries[0].method).toBe('unresolved')
		})

		it('handles mixed currencies in batch', () => {
			const transactions = [
				tx({ id: 1, amount: -100, currency: 'THB' }),
				tx({ id: 2, amount: -10, currency: 'USD' }),
				tx({ id: 3, amount: -20, currency: 'JPY' }),
			]
			const result = ctrl.convert(transactions, rateTable)
			expect(result.entries).toHaveLength(3)
			expect(result.entries[0].method).toBe('base')
			expect(result.entries[1].method).toBe('exact')
			expect(result.entries[2].method).toBe('unresolved')
			expect(result.unresolvedCount).toBe(1)
		})

		it('handles empty transaction list', () => {
			const result = ctrl.convert([], rateTable)
			expect(result.entries).toHaveLength(0)
			expect(result.unresolvedCount).toBe(0)
		})
	})
})
