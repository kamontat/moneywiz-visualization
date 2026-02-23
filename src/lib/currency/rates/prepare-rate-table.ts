import type { FetchLike, PrepareHistoricalRateTableOptions } from './types'
import type { FxRateTable } from '$lib/currency/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { cloneRates, normalizeCacheState, toRateTable } from './cache'
import { fetchRangeRates } from './fetch-rates'
import { collectRequiredDates, toMissingSpans } from './required-dates'

import {
	FX_CACHE_VERSION,
	FX_PROVIDER,
	createEmptyFxRateCacheState,
} from '$lib/currency/constants'
import { readFxRateCache, writeFxRateCache } from '$lib/currency/store'
import { libs } from '$lib/loggers'

const log = libs.extends('currency.rates')

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

	const nextCache = {
		...cache,
		provider: FX_PROVIDER,
		version: FX_CACHE_VERSION,
		updatedAt: new Date().toISOString(),
		rates: nextRates,
	}

	await writeCache(nextCache)
	return toRateTable(nextCache)
}
