import type { ParsedTransaction } from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { createEmptyFxRateCacheState } from './constants'
import { prepareHistoricalRateTable } from './rates'

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

describe('prepareHistoricalRateTable', () => {
	it('skips historical lookup when raw amount already has exact THB conversion', async () => {
		let fetchCount = 0
		let cache = createEmptyFxRateCacheState()
		const transactions = [
			expense('2026-01-10T00:00:00.000Z', -100, 'USD', {
				amount: -3400,
				originalAmount: -100,
				currency: 'USD',
			}),
		]

		const table = await prepareHistoricalRateTable(transactions, {
			fetcher: async () => {
				fetchCount += 1
				return {
					ok: true,
					status: 200,
					json: async () => ({ rates: {} }),
				} as Response
			},
			readCache: async () => cache,
			writeCache: async (next) => {
				cache = next
			},
		})

		expect(fetchCount).toBe(0)
		expect(table.rates).toEqual({})
	})

	it('reuses cached historical rates on subsequent calls', async () => {
		let fetchCount = 0
		let cache = createEmptyFxRateCacheState()
		const transactions = [
			expense('2026-01-10T00:00:00.000Z', -100, 'USD'),
			expense('2026-01-11T00:00:00.000Z', -50, 'USD'),
		]

		const fetcher = async () => {
			fetchCount += 1
			return {
				ok: true,
				status: 200,
				json: async () => ({
					rates: {
						'2026-01-10': { THB: 34 },
						'2026-01-11': { THB: 34.1 },
					},
				}),
			} as Response
		}

		const readCache = async () => cache
		const writeCache = async (next: typeof cache) => {
			cache = next
		}

		await prepareHistoricalRateTable(transactions, {
			fetcher,
			readCache,
			writeCache,
		})
		await prepareHistoricalRateTable(transactions, {
			fetcher,
			readCache,
			writeCache,
		})

		expect(fetchCount).toBe(1)
		expect(cache.rates.USD).toBeDefined()
	})

	it('fetches one missing range per currency instead of per transaction date', async () => {
		let cache = createEmptyFxRateCacheState()
		const urls: string[] = []
		const transactions = [
			expense('2026-01-01T00:00:00.000Z', -100, 'USD'),
			expense('2026-01-02T00:00:00.000Z', -200, 'USD'),
			expense('2026-01-03T00:00:00.000Z', -300, 'USD'),
		]

		await prepareHistoricalRateTable(transactions, {
			fetcher: async (url) => {
				urls.push(url)
				return {
					ok: true,
					status: 200,
					json: async () => ({
						rates: {
							'2026-01-01': { THB: 34 },
							'2026-01-02': { THB: 34.1 },
							'2026-01-03': { THB: 34.2 },
						},
					}),
				} as Response
			},
			readCache: async () => cache,
			writeCache: async (next) => {
				cache = next
			},
		})

		expect(urls).toHaveLength(1)
		expect(urls[0]).toContain('/2026-01-01..2026-01-03')
		expect(urls[0]).toContain('from=USD')
		expect(urls[0]).toContain('to=THB')
	})
})
