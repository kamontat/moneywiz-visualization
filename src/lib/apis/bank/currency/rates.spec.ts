import type { FxRateCacheState } from '$lib/currency/models'
import { describe, expect, it, vi } from 'vitest'

import {
	collectRequiredCurrencyDates,
	fetchRangeRates,
	parseRatesPayload,
	prepareRateTable,
	resolveRate,
	toMissingSpans,
} from './rates'

describe('collectRequiredCurrencyDates', () => {
	it('returns empty map for empty transactions', () => {
		const result = collectRequiredCurrencyDates([])
		expect(result.size).toBe(0)
	})

	it('skips THB transactions', () => {
		const result = collectRequiredCurrencyDates([
			{ currency: 'THB', date: new Date('2026-01-15') },
		])
		expect(result.size).toBe(0)
	})

	it('collects non-THB currencies and dates', () => {
		const result = collectRequiredCurrencyDates([
			{ currency: 'USD', date: new Date('2026-01-15') },
			{ currency: 'EUR', date: new Date('2026-01-16') },
			{ currency: 'USD', date: new Date('2026-01-17') },
		])
		expect(result.size).toBe(2)
		expect([...result.get('USD')!]).toEqual(
			expect.arrayContaining(['2026-01-15', '2026-01-17'])
		)
		expect([...result.get('EUR')!]).toEqual(['2026-01-16'])
	})

	it('deduplicates same currency-date pairs', () => {
		const result = collectRequiredCurrencyDates([
			{ currency: 'USD', date: new Date('2026-01-15') },
			{ currency: 'USD', date: new Date('2026-01-15') },
		])
		expect(result.get('USD')!.size).toBe(1)
	})
})

describe('toMissingSpans', () => {
	it('returns empty for no required dates', () => {
		expect(toMissingSpans([], {})).toEqual([])
	})

	it('returns single span when no existing data', () => {
		const spans = toMissingSpans(['2026-01-10', '2026-01-20'], {})
		expect(spans).toEqual([{ start: '2026-01-10', end: '2026-01-20' }])
	})

	it('returns span before existing range', () => {
		const spans = toMissingSpans(['2026-01-05', '2026-01-15'], {
			'2026-01-10': 35,
			'2026-01-15': 36,
		})
		expect(spans).toEqual([{ start: '2026-01-05', end: '2026-01-10' }])
	})

	it('returns span after existing range', () => {
		const spans = toMissingSpans(['2026-01-10', '2026-01-25'], {
			'2026-01-10': 35,
			'2026-01-15': 36,
		})
		expect(spans).toEqual([{ start: '2026-01-15', end: '2026-01-25' }])
	})

	it('returns both spans when required dates extend both ends', () => {
		const spans = toMissingSpans(['2026-01-01', '2026-01-31'], {
			'2026-01-10': 35,
			'2026-01-20': 36,
		})
		expect(spans).toHaveLength(2)
		expect(spans[0]).toEqual({ start: '2026-01-01', end: '2026-01-10' })
		expect(spans[1]).toEqual({ start: '2026-01-20', end: '2026-01-31' })
	})

	it('returns empty when all dates covered', () => {
		const spans = toMissingSpans(['2026-01-12', '2026-01-14'], {
			'2026-01-10': 35,
			'2026-01-20': 36,
		})
		expect(spans).toEqual([])
	})
})

describe('parseRatesPayload', () => {
	it('returns empty for null', () => {
		expect(parseRatesPayload(null)).toEqual({})
	})

	it('returns empty for non-object', () => {
		expect(parseRatesPayload('hello')).toEqual({})
	})

	it('returns empty for missing rates node', () => {
		expect(parseRatesPayload({ date: '2026-01-15' })).toEqual({})
	})

	it('parses single-date response', () => {
		const result = parseRatesPayload({
			date: '2026-01-15',
			rates: { THB: 35.5 },
		})
		expect(result).toEqual({ '2026-01-15': 35.5 })
	})

	it('parses date-range response', () => {
		const result = parseRatesPayload({
			start_date: '2026-01-10',
			end_date: '2026-01-12',
			rates: {
				'2026-01-10': { THB: 35.0 },
				'2026-01-11': { THB: 35.2 },
				'2026-01-12': { THB: 35.5 },
			},
		})
		expect(result).toEqual({
			'2026-01-10': 35.0,
			'2026-01-11': 35.2,
			'2026-01-12': 35.5,
		})
	})

	it('skips entries with zero or negative rates', () => {
		const result = parseRatesPayload({
			rates: {
				'2026-01-10': { THB: 0 },
				'2026-01-11': { THB: -1 },
				'2026-01-12': { THB: 35.5 },
			},
		})
		expect(result).toEqual({ '2026-01-12': 35.5 })
	})
})

describe('fetchRangeRates', () => {
	it('fetches and parses rates from API', async () => {
		const fetcher = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					start_date: '2026-01-10',
					end_date: '2026-01-12',
					rates: {
						'2026-01-10': { THB: 35.0 },
						'2026-01-12': { THB: 35.5 },
					},
				}),
		})

		const result = await fetchRangeRates(
			'USD',
			{ start: '2026-01-10', end: '2026-01-12' },
			fetcher
		)

		expect(result).toEqual({
			'2026-01-10': 35.0,
			'2026-01-12': 35.5,
		})
		expect(fetcher).toHaveBeenCalledWith(
			'https://api.frankfurter.app/2026-01-10..2026-01-12?from=USD&to=THB'
		)
	})

	it('throws on non-ok response', async () => {
		const fetcher = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
		})

		await expect(
			fetchRangeRates(
				'USD',
				{ start: '2026-01-10', end: '2026-01-12' },
				fetcher
			)
		).rejects.toThrow('HTTP 404')
	})
})

describe('resolveRate', () => {
	const rateTable = {
		baseCurrency: 'THB' as const,
		rates: {
			USD: { '2026-01-10': 35.0, '2026-01-15': 35.5 },
			EUR: { '2026-01-14': 38.0 },
		},
	}

	it('returns exact rate for matching date', () => {
		expect(resolveRate(rateTable, 'USD', '2026-01-15')).toBe(35.5)
	})

	it('returns nearest earlier date rate', () => {
		expect(resolveRate(rateTable, 'USD', '2026-01-12')).toBe(35.0)
	})

	it('returns undefined when date is before all rates', () => {
		expect(resolveRate(rateTable, 'EUR', '2026-01-01')).toBeUndefined()
	})

	it('returns undefined for unknown currency', () => {
		expect(resolveRate(rateTable, 'JPY', '2026-01-15')).toBeUndefined()
	})

	it('handles case-insensitive currency lookup', () => {
		expect(resolveRate(rateTable, 'usd', '2026-01-15')).toBe(35.5)
	})
})

describe('prepareRateTable', () => {
	it('returns empty table for no transactions', async () => {
		const result = await prepareRateTable([])
		expect(result).toEqual({ baseCurrency: 'THB', rates: {} })
	})

	it('returns cached rates when no missing spans', async () => {
		const cache: FxRateCacheState = {
			baseCurrency: 'THB',
			provider: 'frankfurter',
			version: 1,
			updatedAt: '2026-01-01T00:00:00Z',
			rates: { USD: { '2026-01-10': 35.0, '2026-01-20': 36.0 } },
		}
		const readCache = vi.fn().mockResolvedValue(cache)
		const writeCache = vi.fn()

		const result = await prepareRateTable(
			[{ currency: 'USD', date: new Date('2026-01-15') }],
			{ readCache, writeCache }
		)

		expect(result.rates.USD).toBeDefined()
		expect(writeCache).not.toHaveBeenCalled()
	})

	it('fetches missing rates and updates cache', async () => {
		const cache: FxRateCacheState = {
			baseCurrency: 'THB',
			provider: 'frankfurter',
			version: 1,
			updatedAt: '',
			rates: {},
		}
		const readCache = vi.fn().mockResolvedValue(cache)
		const writeCache = vi.fn()
		const fetcher = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					date: '2026-01-15',
					rates: { THB: 35.5 },
				}),
		})

		const result = await prepareRateTable(
			[{ currency: 'USD', date: new Date('2026-01-15') }],
			{ readCache, writeCache, fetcher }
		)

		expect(result.rates.USD).toBeDefined()
		expect(result.rates.USD['2026-01-15']).toBe(35.5)
		expect(writeCache).toHaveBeenCalledOnce()
	})

	it('handles fetch failures gracefully', async () => {
		const cache: FxRateCacheState = {
			baseCurrency: 'THB',
			provider: 'frankfurter',
			version: 1,
			updatedAt: '',
			rates: {},
		}
		const readCache = vi.fn().mockResolvedValue(cache)
		const writeCache = vi.fn()
		const fetcher = vi.fn().mockRejectedValue(new Error('Network error'))

		const result = await prepareRateTable(
			[{ currency: 'USD', date: new Date('2026-01-15') }],
			{ readCache, writeCache, fetcher }
		)

		expect(result.rates).toEqual({})
		expect(writeCache).not.toHaveBeenCalled()
	})

	it('skips THB-only transactions', async () => {
		const fetcher = vi.fn()
		const result = await prepareRateTable(
			[{ currency: 'THB', date: new Date('2026-01-15') }],
			{ fetcher }
		)

		expect(result).toEqual({ baseCurrency: 'THB', rates: {} })
		expect(fetcher).not.toHaveBeenCalled()
	})
})
