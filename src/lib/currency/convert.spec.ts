import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { convertTransactionsToTHB, summarizeConversion } from './convert'

const expense = (
	date: string,
	amount: number,
	currency = 'THB',
	raw: Record<string, unknown> = {}
): ParsedTransaction => {
	return {
		type: 'Expense',
		account: { type: 'Checking', name: 'Main', extra: null },
		description: 'Expense',
		amount: { value: amount, currency },
		date: new Date(date),
		memo: '',
		tags: [],
		raw,
		payee: 'Store',
		category: { category: 'Food', subcategory: '' },
		checkNumber: '',
	} as ParsedTransaction
}

describe('convertTransactionsToTHB', () => {
	it('uses exact date, weekend fallback, and excludes unresolved conversion rows', () => {
		const table = {
			baseCurrency: 'THB' as const,
			rates: {
				USD: {
					'2026-02-20': 31.205,
				},
			},
		}

		const result = convertTransactionsToTHB(
			[
				expense('2026-02-20T00:00:00.000Z', -100, 'THB'),
				expense('2026-02-22T00:00:00.000Z', -10, 'USD'),
				expense('2026-02-18T00:00:00.000Z', -5, 'USD'),
			],
			table
		)

		expect(result.transactions).toHaveLength(2)
		expect(result.transactions[0].amount.value).toBe(-100)
		expect(result.transactions[0].amount.currency).toBe('THB')
		expect(result.transactions[1].amount.value).toBeCloseTo(-312.05, 2)
		expect(result.transactions[1].amount.currency).toBe('THB')
		expect(result.summary.estimatedCount).toBe(1)
		expect(result.summary.unresolvedCount).toBe(1)
		expect(result.summary.unresolvedByCurrency).toEqual({ USD: 1 })
	})

	it('uses exact raw THB amount when original foreign amount is present', () => {
		const result = convertTransactionsToTHB(
			[
				expense('2026-01-10T00:00:00.000Z', -100, 'USD', {
					amount: -3400,
					originalAmount: -100,
					currency: 'USD',
				}),
			],
			{
				baseCurrency: 'THB',
				rates: {},
			}
		)

		expect(result.transactions).toHaveLength(1)
		expect(result.transactions[0].amount.value).toBe(-3400)
		expect(result.transactions[0].amount.currency).toBe('THB')
		expect(result.summary.exactCount).toBe(1)
		expect(result.summary.estimatedCount).toBe(0)
		expect(result.summary.unresolvedCount).toBe(0)
	})

	it('merges conversion summaries across multiple conversion results', () => {
		const merged = summarizeConversion([
			{
				total: 10,
				convertedCount: 9,
				exactCount: 2,
				estimatedCount: 3,
				unresolvedCount: 1,
				unresolvedByCurrency: { USD: 1 },
			},
			{
				total: 5,
				convertedCount: 4,
				exactCount: 1,
				estimatedCount: 2,
				unresolvedCount: 1,
				unresolvedByCurrency: { EUR: 1 },
			},
		])

		expect(merged.total).toBe(15)
		expect(merged.convertedCount).toBe(13)
		expect(merged.exactCount).toBe(3)
		expect(merged.estimatedCount).toBe(5)
		expect(merged.unresolvedCount).toBe(2)
		expect(merged.unresolvedByCurrency).toEqual({ USD: 1, EUR: 1 })
	})
})
