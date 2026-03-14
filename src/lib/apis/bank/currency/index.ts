import type { CurrencyConverter, RateProviderOptions } from './types.js'
import { readFxRateCache, writeFxRateCache } from './cache.js'
import { prepareRateTable, resolveRate } from './rates.js'

export type { CurrencyConverter } from './types.js'
export type { DateSpan, FetchLike, RateProviderOptions } from './types.js'

export const createCurrencyConverter = (
	options: RateProviderOptions = {}
): CurrencyConverter => {
	return {
		name: 'currency',
		fetchRates: (transactions) =>
			prepareRateTable(transactions, {
				...options,
				readCache: options.readCache ?? readFxRateCache,
				writeCache: options.writeCache ?? writeFxRateCache,
			}),
		resolveRate,
	}
}
