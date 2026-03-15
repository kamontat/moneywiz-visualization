import type { FxRateCacheState } from './models'
import type { StateEqualFn, StateNormalizeFn } from '$utils/states/models'
import { createEmptyFxRateCacheState } from './constants'

import { libs } from '$lib/loggers'
import { newEmptyState, newState } from '$utils/states'

export type FxRateCacheStoreState = FxRateCacheState

const log = libs.extends('currency.state')

const normalizeRates = (
	rates: FxRateCacheState['rates'] | undefined
): FxRateCacheState['rates'] => {
	if (!rates || typeof rates !== 'object') return {}

	const normalized: FxRateCacheState['rates'] = {}
	for (const [currency, rawDateMap] of Object.entries(rates)) {
		if (!rawDateMap || typeof rawDateMap !== 'object') continue
		const dateMap: Record<string, number> = {}
		for (const [date, rawRate] of Object.entries(rawDateMap)) {
			if (typeof rawRate !== 'number' || !Number.isFinite(rawRate)) continue
			if (rawRate <= 0) continue
			dateMap[date] = rawRate
		}
		if (Object.keys(dateMap).length > 0) {
			normalized[currency.toUpperCase()] = dateMap
		}
	}

	return normalized
}

const normalize: StateNormalizeFn<FxRateCacheStoreState> = (state) => {
	const empty = createEmptyFxRateCacheState()
	if (!state) {
		log.debug('normalize empty FX cache state')
		return empty
	}

	return {
		baseCurrency: empty.baseCurrency,
		provider:
			typeof state.provider === 'string' && state.provider.length > 0
				? state.provider
				: empty.provider,
		version:
			typeof state.version === 'number' && Number.isFinite(state.version)
				? state.version
				: empty.version,
		updatedAt:
			typeof state.updatedAt === 'string' && state.updatedAt.length > 0
				? state.updatedAt
				: empty.updatedAt,
		rates: normalizeRates(state.rates),
	}
}

const equal: StateEqualFn<FxRateCacheStoreState> = (a, b) => {
	return (
		a.provider === b.provider &&
		a.version === b.version &&
		a.updatedAt === b.updatedAt
	)
}

export const initFxRateCacheState = () => {
	const empty = newEmptyState<FxRateCacheStoreState>(
		createEmptyFxRateCacheState()
	)
	return newState(empty, {
		normalize,
		equal,
	})
}
