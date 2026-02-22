import type { FxRateCacheState, FxRateTable } from './models'
import type { ParsedTransaction } from '$lib/transactions/models'
import {
	BASE_CURRENCY,
	FX_CACHE_VERSION,
	FX_PROVIDER,
	FX_PROVIDER_BASE_URL,
	createEmptyFxRateCacheState,
} from './constants'
import { readFxRateCache, writeFxRateCache } from './store'

import { libs } from '$lib/loggers'

const log = libs.extends('currency.rates')

const EPSILON = 0.000001

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export interface PrepareHistoricalRateTableOptions {
	fetcher?: FetchLike
	readCache?: () => Promise<FxRateCacheState>
	writeCache?: (cache: FxRateCacheState) => Promise<void>
}

export const normalizeCurrencyCode = (
	currency: string | undefined | null
): string => {
	if (!currency) return BASE_CURRENCY
	const normalized = currency.trim().toUpperCase()
	return normalized.length > 0 ? normalized : BASE_CURRENCY
}

export const toTransactionDateKey = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const toFiniteNumber = (value: unknown): number | undefined => {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string') {
		const parsed = Number(value)
		if (Number.isFinite(parsed)) return parsed
	}
	return undefined
}

const toRawCurrency = (transaction: ParsedTransaction): string | undefined => {
	const currency = transaction.raw.currency
	if (typeof currency !== 'string') return undefined
	const normalized = currency.trim().toUpperCase()
	return normalized.length > 0 ? normalized : undefined
}

export const hasExactRawThbAmount = (
	transaction: ParsedTransaction
): boolean => {
	const rawCurrency = toRawCurrency(transaction)
	if (!rawCurrency || rawCurrency === BASE_CURRENCY) return false

	const rawAmount = toFiniteNumber(transaction.raw.amount)
	const rawOriginalAmount = toFiniteNumber(transaction.raw.originalAmount)
	if (rawAmount === undefined || rawOriginalAmount === undefined) return false
	if (Math.abs(rawOriginalAmount) < EPSILON) return false

	return Math.abs(Math.abs(rawAmount) - Math.abs(rawOriginalAmount)) > EPSILON
}

export const getExactRawThbAmount = (
	transaction: ParsedTransaction
): number | undefined => {
	if (!hasExactRawThbAmount(transaction)) return undefined
	return toFiniteNumber(transaction.raw.amount)
}

const normalizeRates = (
	rawRates: FxRateCacheState['rates'] | undefined
): FxRateCacheState['rates'] => {
	if (!rawRates || typeof rawRates !== 'object') return {}

	const normalized: FxRateCacheState['rates'] = {}
	for (const [currency, rawDateMap] of Object.entries(rawRates)) {
		if (!rawDateMap || typeof rawDateMap !== 'object') continue
		const ratesByDate: Record<string, number> = {}
		for (const [date, rate] of Object.entries(rawDateMap)) {
			if (typeof rate !== 'number' || !Number.isFinite(rate)) continue
			if (rate <= 0) continue
			ratesByDate[date] = rate
		}
		if (Object.keys(ratesByDate).length > 0) {
			normalized[currency.toUpperCase()] = ratesByDate
		}
	}

	return normalized
}

const normalizeCacheState = (
	cache: FxRateCacheState | undefined
): FxRateCacheState => {
	const empty = createEmptyFxRateCacheState()
	if (!cache) return empty

	return {
		baseCurrency: BASE_CURRENCY,
		provider:
			typeof cache.provider === 'string' && cache.provider.length > 0
				? cache.provider
				: FX_PROVIDER,
		version:
			typeof cache.version === 'number' && Number.isFinite(cache.version)
				? cache.version
				: FX_CACHE_VERSION,
		updatedAt:
			typeof cache.updatedAt === 'string' && cache.updatedAt.length > 0
				? cache.updatedAt
				: empty.updatedAt,
		rates: normalizeRates(cache.rates),
	}
}

const cloneRates = (
	rates: FxRateCacheState['rates']
): FxRateCacheState['rates'] => {
	const cloned: FxRateCacheState['rates'] = {}
	for (const [currency, dateMap] of Object.entries(rates)) {
		cloned[currency] = { ...dateMap }
	}
	return cloned
}

const collectRequiredDates = (
	transactions: ParsedTransaction[]
): Map<string, Set<string>> => {
	const required = new Map<string, Set<string>>()

	for (const transaction of transactions) {
		const currency = normalizeCurrencyCode(transaction.amount.currency)
		if (currency === BASE_CURRENCY) continue
		if (hasExactRawThbAmount(transaction)) continue

		const date = toTransactionDateKey(transaction.date)
		const dates = required.get(currency)
		if (dates) {
			dates.add(date)
			continue
		}
		required.set(currency, new Set([date]))
	}

	return required
}

interface DateSpan {
	start: string
	end: string
}

const toMissingSpans = (
	requiredDates: string[],
	existingByDate: Record<string, number>
): DateSpan[] => {
	if (requiredDates.length === 0) return []

	const sortedRequired = [...requiredDates].sort()
	const requiredMin = sortedRequired[0]
	const requiredMax = sortedRequired[sortedRequired.length - 1]

	const existingDates = Object.keys(existingByDate).sort()
	if (existingDates.length === 0) {
		return [{ start: requiredMin, end: requiredMax }]
	}

	const spans: DateSpan[] = []
	const existingMin = existingDates[0]
	const existingMax = existingDates[existingDates.length - 1]

	if (requiredMin < existingMin) {
		spans.push({
			start: requiredMin,
			end: existingMin,
		})
	}

	if (requiredMax > existingMax) {
		spans.push({
			start: existingMax,
			end: requiredMax,
		})
	}

	return spans
}

const parseRatesPayload = (payload: unknown): Record<string, number> => {
	if (!payload || typeof payload !== 'object') return {}

	const body = payload as Record<string, unknown>
	const ratesNode = body.rates
	if (!ratesNode || typeof ratesNode !== 'object') return {}

	const entries = Object.entries(ratesNode)
	if (entries.length === 0) return {}

	const firstValue = entries[0][1]
	if (typeof firstValue === 'number') {
		const rate = toFiniteNumber(
			(ratesNode as Record<string, unknown>)[BASE_CURRENCY]
		)
		const singleDate =
			typeof body.date === 'string'
				? body.date
				: typeof body.end_date === 'string'
					? body.end_date
					: undefined
		if (!singleDate || rate === undefined || rate <= 0) return {}
		return { [singleDate]: rate }
	}

	const parsed: Record<string, number> = {}
	for (const [marketDate, value] of entries) {
		if (!value || typeof value !== 'object') continue
		const rate = toFiniteNumber(
			(value as Record<string, unknown>)[BASE_CURRENCY]
		)
		if (rate === undefined || rate <= 0) continue
		parsed[marketDate] = rate
	}

	return parsed
}

const fetchRangeRates = async (
	currency: string,
	span: DateSpan,
	fetcher: FetchLike
): Promise<Record<string, number>> => {
	const from = encodeURIComponent(currency)
	const to = encodeURIComponent(BASE_CURRENCY)
	const url =
		`${FX_PROVIDER_BASE_URL}/${span.start}..${span.end}` +
		`?from=${from}&to=${to}`

	const response = await fetcher(url)
	if (!response.ok) {
		throw new Error(
			`FX provider request failed for ${currency} ` +
				`(${span.start}..${span.end}) with HTTP ${response.status}`
		)
	}

	const payload = (await response.json()) as unknown
	return parseRatesPayload(payload)
}

const toRateTable = (cache: FxRateCacheState): FxRateTable => ({
	baseCurrency: BASE_CURRENCY,
	rates: cloneRates(cache.rates),
})

export const prepareHistoricalRateTable = async (
	transactions: ParsedTransaction[],
	options: PrepareHistoricalRateTableOptions = {}
): Promise<FxRateTable> => {
	const fetcher = options.fetcher ?? (fetch as FetchLike)
	const readCache = options.readCache ?? readFxRateCache
	const writeCache = options.writeCache ?? writeFxRateCache

	if (transactions.length === 0) {
		const empty = createEmptyFxRateCacheState()
		return toRateTable(empty)
	}

	const cache = normalizeCacheState(await readCache())
	const nextRates = cloneRates(cache.rates)
	const requiredByCurrency = collectRequiredDates(transactions)
	let didChange = false

	for (const [currency, requiredDateSet] of requiredByCurrency.entries()) {
		const requiredDates = [...requiredDateSet].sort()
		const currentByDate = nextRates[currency] ?? {}
		const spans = toMissingSpans(requiredDates, currentByDate)
		if (spans.length === 0) continue

		for (const span of spans) {
			try {
				const rates = await fetchRangeRates(currency, span, fetcher)
				if (Object.keys(rates).length === 0) continue
				nextRates[currency] = {
					...(nextRates[currency] ?? {}),
					...rates,
				}
				didChange = true
			} catch (error) {
				log.warn(
					'failed to fetch historical FX rates for %s %s..%s:',
					currency,
					span.start,
					span.end,
					error
				)
			}
		}
	}

	if (!didChange) return toRateTable(cache)

	const nextCache: FxRateCacheState = {
		...cache,
		provider: FX_PROVIDER,
		version: FX_CACHE_VERSION,
		updatedAt: new Date().toISOString(),
		rates: nextRates,
	}

	await writeCache(nextCache)
	return toRateTable(nextCache)
}
