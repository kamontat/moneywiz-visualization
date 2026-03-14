import type { DateSpan, FetchLike, RateProviderOptions } from './types.js'
import type {
	FxRateCacheState,
	FxRateTable,
} from '$lib/currency/models/index.js'
import {
	createEmptyFxRateCacheState,
	normalizeFxRateCacheState,
} from './cache.js'

import {
	BASE_CURRENCY,
	FX_CACHE_VERSION,
	FX_PROVIDER,
	FX_PROVIDER_BASE_URL,
	normalizeCurrencyCode,
	toDateKey,
	toFiniteNumber,
} from '$lib/utils/currency/index.js'

export const collectRequiredCurrencyDates = (
	transactions: readonly { currency: string; date: Date }[]
): Map<string, Set<string>> => {
	const required = new Map<string, Set<string>>()

	for (const tx of transactions) {
		const currency = normalizeCurrencyCode(tx.currency)
		if (currency === BASE_CURRENCY) continue

		const date = toDateKey(tx.date)
		const dates = required.get(currency)
		if (dates) {
			dates.add(date)
		} else {
			required.set(currency, new Set([date]))
		}
	}

	return required
}

export const toMissingSpans = (
	requiredDates: string[],
	existingByDate: Record<string, number>
): DateSpan[] => {
	if (requiredDates.length === 0) return []

	const sorted = [...requiredDates].sort()
	const requiredMin = sorted[0]
	const requiredMax = sorted[sorted.length - 1]

	const existing = Object.keys(existingByDate).sort()
	if (existing.length === 0) {
		return [{ start: requiredMin, end: requiredMax }]
	}

	const spans: DateSpan[] = []
	const existingMin = existing[0]
	const existingMax = existing[existing.length - 1]

	if (requiredMin < existingMin) {
		spans.push({ start: requiredMin, end: existingMin })
	}

	if (requiredMax > existingMax) {
		spans.push({ start: existingMax, end: requiredMax })
	}

	return spans
}

export const parseRatesPayload = (payload: unknown): Record<string, number> => {
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

export const fetchRangeRates = async (
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
const cloneRates = (
	rates: FxRateCacheState['rates']
): FxRateCacheState['rates'] => {
	const cloned: FxRateCacheState['rates'] = {}
	for (const [currency, dateMap] of Object.entries(rates)) {
		cloned[currency] = { ...dateMap }
	}
	return cloned
}
export const prepareRateTable = async (
	transactions: readonly { currency: string; date: Date }[],
	options: RateProviderOptions = {}
): Promise<FxRateTable> => {
	const fetcher = options.fetcher ?? (globalThis.fetch as FetchLike)
	const readCache =
		options.readCache ?? (() => Promise.resolve(createEmptyFxRateCacheState()))
	const writeCache = options.writeCache ?? (() => Promise.resolve())

	if (transactions.length === 0) {
		return { baseCurrency: BASE_CURRENCY, rates: {} }
	}

	const cache = normalizeFxRateCacheState(await readCache())
	const nextRates = cloneRates(cache.rates)
	const requiredByCurrency = collectRequiredCurrencyDates(transactions)
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
			} catch {
				// Silently skip failed ranges; unresolved conversions will
				// be flagged downstream by the CurrencyController.
			}
		}
	}

	if (!didChange) {
		return { baseCurrency: BASE_CURRENCY, rates: cloneRates(cache.rates) }
	}

	const nextCache: FxRateCacheState = {
		...cache,
		provider: FX_PROVIDER,
		version: FX_CACHE_VERSION,
		updatedAt: new Date().toISOString(),
		rates: nextRates,
	}

	await writeCache(nextCache)
	return { baseCurrency: BASE_CURRENCY, rates: cloneRates(nextRates) }
}

export const resolveRate = (
	rateTable: FxRateTable,
	currency: string,
	dateKey: string
): number | undefined => {
	const match = resolveRateMatch(rateTable, currency, dateKey)
	return match?.rate
}

export interface ResolvedRateMatch {
	readonly date: string
	readonly rate: number
	readonly exact: boolean
}

export const resolveRateMatch = (
	rateTable: FxRateTable,
	currency: string,
	dateKey: string
): ResolvedRateMatch | undefined => {
	const currencyRates = rateTable.rates[currency.toUpperCase()]
	if (!currencyRates) return undefined

	const dates = Object.keys(currencyRates).sort()
	let candidate: string | undefined

	let low = 0
	let high = dates.length - 1
	while (low <= high) {
		const mid = Math.floor((low + high) / 2)
		if (dates[mid] <= dateKey) {
			candidate = dates[mid]
			low = mid + 1
		} else {
			high = mid - 1
		}
	}

	if (!candidate) return undefined
	const rate = currencyRates[candidate]
	if (!Number.isFinite(rate) || rate <= 0) return undefined

	return {
		date: candidate,
		rate,
		exact: candidate === dateKey,
	}
}
