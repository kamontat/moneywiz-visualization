export type FxRatesByDate = Record<string, number>

export type FxRatesByCurrency = Record<string, FxRatesByDate>

export interface FxRateTable {
	baseCurrency: 'THB'
	rates: FxRatesByCurrency
}

export interface FxRateCacheState extends FxRateTable {
	provider: string
	version: number
	updatedAt: string
}
