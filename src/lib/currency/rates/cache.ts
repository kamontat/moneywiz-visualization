import type { FxRateCacheState, FxRateTable } from '$lib/currency/models'
import {
	BASE_CURRENCY,
	FX_CACHE_VERSION,
	FX_PROVIDER,
	createEmptyFxRateCacheState,
} from '$lib/currency/constants'

export const normalizeRates = (
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

export const normalizeCacheState = (
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

export const cloneRates = (
	rates: FxRateCacheState['rates']
): FxRateCacheState['rates'] => {
	const cloned: FxRateCacheState['rates'] = {}
	for (const [currency, dateMap] of Object.entries(rates)) {
		cloned[currency] = { ...dateMap }
	}
	return cloned
}

export const toRateTable = (cache: FxRateCacheState): FxRateTable => ({
	baseCurrency: BASE_CURRENCY,
	rates: cloneRates(cache.rates),
})
