import type { FxRateCacheState } from './models'
import type { State } from '$utils/states/models'
import { createEmptyFxRateCacheState } from './constants'
import { initFxRateCacheState } from './state'

import { libs } from '$lib/loggers'
import { localDBV1, newStore, STATE_FX_RATE_CACHE_V1 } from '$utils/stores'

const initFxRateCacheStore = (state: State<FxRateCacheState>) => {
	const db = localDBV1
	const log = libs.extends('currency.store')

	const store = newStore(db, state, {
		get: (db) => db.get(STATE_FX_RATE_CACHE_V1, 'default'),
		set: (db, value) => {
			db.set(STATE_FX_RATE_CACHE_V1, 'default', value)
			db.trigger('set', STATE_FX_RATE_CACHE_V1, 'default', value.updatedAt)
		},
		del: (db) => {
			db.delete(STATE_FX_RATE_CACHE_V1, 'default')
			db.trigger('delete', STATE_FX_RATE_CACHE_V1, 'default', '')
		},
		log,
	})

	if (db.available()) {
		db.onChangeByKey(STATE_FX_RATE_CACHE_V1, 'default', async (_, data) => {
			const value = await data?.read()
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
	if (!localDBV1.available()) return memoryCache

	const raw = await localDBV1.get(STATE_FX_RATE_CACHE_V1, 'default')
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

	if (!localDBV1.available()) return
	await fxRateCacheStore.setAsync(normalized)
}

export const clearFxRateCache = async (): Promise<void> => {
	memoryCache = createEmptyFxRateCacheState()
	hasMemoryCache = true
	if (!localDBV1.available()) return
	await fxRateCacheStore.resetAsync()
}
