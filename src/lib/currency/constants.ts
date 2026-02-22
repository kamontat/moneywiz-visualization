import type { FxRateCacheState } from './models'

export const BASE_CURRENCY = 'THB' as const
export const FX_PROVIDER = 'frankfurter' as const
export const FX_PROVIDER_BASE_URL = 'https://api.frankfurter.app' as const
export const FX_CACHE_VERSION = 1 as const

export const createEmptyFxRateCacheState = (): FxRateCacheState => ({
	baseCurrency: BASE_CURRENCY,
	provider: FX_PROVIDER,
	version: FX_CACHE_VERSION,
	updatedAt: '',
	rates: {},
})
