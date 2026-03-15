import type { CurrencyConverter, RateProviderOptions } from './types'
import { readFxRateCache, writeFxRateCache } from './cache'
import { prepareRateTable, resolveRate } from './rates'

export type { CurrencyConverter } from './types'
export type { DateSpan, FetchLike, RateProviderOptions } from './types'

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
