import type { FxRateCacheState } from '$lib/currency/models'

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export interface PrepareHistoricalRateTableOptions {
	fetcher?: FetchLike
	readCache?: () => Promise<FxRateCacheState>
	writeCache?: (cache: FxRateCacheState) => Promise<void>
}

export interface DateSpan {
	start: string
	end: string
}
