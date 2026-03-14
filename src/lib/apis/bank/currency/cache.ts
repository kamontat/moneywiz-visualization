import type { FxRateCacheState } from '$lib/currency/models/index.js'
import { AStorageProvider } from '$lib/providers/astorage/index.js'
import {
	BASE_CURRENCY,
	FX_CACHE_VERSION,
	FX_PROVIDER,
} from '$lib/utils/currency/index.js'

const FX_RATE_CACHE_STORAGE_KEY = 'moneywiz:v3:fx-rates'

const getStorageProvider = ():
	| AStorageProvider<'localStorage', 1>
	| undefined => {
	if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
		return undefined
	}

	try {
		return new AStorageProvider('localStorage', 1, globalThis.localStorage)
	} catch {
		return undefined
	}
}

export const createEmptyFxRateCacheState = (): FxRateCacheState => ({
	baseCurrency: BASE_CURRENCY,
	provider: FX_PROVIDER,
	version: FX_CACHE_VERSION,
	updatedAt: '',
	rates: {},
})

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

export const normalizeFxRateCacheState = (
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

export const readFxRateCache = async (): Promise<FxRateCacheState> => {
	const storage = getStorageProvider()
	if (!storage) return createEmptyFxRateCacheState()

	return normalizeFxRateCacheState(
		storage.get<FxRateCacheState>(FX_RATE_CACHE_STORAGE_KEY)
	)
}

export const writeFxRateCache = async (
	cache: FxRateCacheState
): Promise<void> => {
	const storage = getStorageProvider()
	if (!storage) return

	storage.set(FX_RATE_CACHE_STORAGE_KEY, normalizeFxRateCacheState(cache))
}

export const clearFxRateCache = async (): Promise<void> => {
	const storage = getStorageProvider()
	if (!storage) return

	storage.delete(FX_RATE_CACHE_STORAGE_KEY)
}
