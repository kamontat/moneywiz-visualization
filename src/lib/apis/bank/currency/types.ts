import type {
	FxRateCacheState,
	FxRateTable,
} from '$lib/currency/models/index.js'

export interface DateSpan {
	readonly start: string
	readonly end: string
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export interface RateProviderOptions {
	readonly fetcher?: FetchLike
	readonly readCache?: () => Promise<FxRateCacheState>
	readonly writeCache?: (cache: FxRateCacheState) => Promise<void>
}

export interface CurrencyConverter {
	readonly name: 'currency'
	fetchRates(
		transactions: readonly { currency: string; date: Date }[]
	): Promise<FxRateTable>
	resolveRate(
		rateTable: FxRateTable,
		currency: string,
		dateKey: string
	): number | undefined
}
