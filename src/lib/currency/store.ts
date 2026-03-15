import type { FxRateCacheState } from './models'
import type { State } from '$utils/states/models'
import { createEmptyFxRateCacheState } from './constants'
import { initFxRateCacheState } from './state'

import { libs } from '$lib/loggers'
import { localstorage } from '$lib/providers/localstorage'
import { newStore, STATE_FX_RATE_CACHE_V1 } from '$utils/stores'

const initFxRateCacheStore = (state: State<FxRateCacheState>) => {
	const table = localstorage.table(STATE_FX_RATE_CACHE_V1)
	const log = libs.extends('currency.store')

	const store = newStore(state, {
		available: () => localstorage.available(),
		get: () => table.get<FxRateCacheState>('default'),
		set: (value) => table.set('default', value),
		del: () => table.delete('default'),
		log,
	})

	if (localstorage.available()) {
		table.onChange<FxRateCacheState>('default', (value) => {
			if (!value) return
			memoryCache = value
			hasMemoryCache = true
			store.update(() => value)
		})
	}

	return store
}

export const fxRateCacheState = initFxRateCacheState()
export const fxRateCacheStore = initFxRateCacheStore(fxRateCacheState)

let memoryCache = createEmptyFxRateCacheState()
let hasMemoryCache = false

export const readFxRateCache = async (): Promise<FxRateCacheState> => {
	if (hasMemoryCache) return memoryCache
	if (!localstorage.available()) return memoryCache

	const table = localstorage.table(STATE_FX_RATE_CACHE_V1)
	const raw = table.get<FxRateCacheState>('default')
	const normalized = fxRateCacheState.normalize(raw ?? memoryCache)
	memoryCache = normalized
	hasMemoryCache = true
	return normalized
}

export const writeFxRateCache = async (
	cache: FxRateCacheState
): Promise<void> => {
	const normalized = fxRateCacheState.normalize(cache)
	memoryCache = normalized
	hasMemoryCache = true

	if (!localstorage.available()) return
	await fxRateCacheStore.setAsync(normalized)
}

export const clearFxRateCache = async (): Promise<void> => {
	memoryCache = createEmptyFxRateCacheState()
	hasMemoryCache = true
	if (!localstorage.available()) return
	await fxRateCacheStore.resetAsync()
}
