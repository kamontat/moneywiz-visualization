import type { FxRateCacheState } from '$lib/currency/models'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
	clearFxRateCache,
	createEmptyFxRateCacheState,
	normalizeFxRateCacheState,
	readFxRateCache,
	writeFxRateCache,
} from './cache'

class MemoryStorage implements Storage {
	#store = new Map<string, string>()

	get length(): number {
		return this.#store.size
	}

	clear(): void {
		this.#store.clear()
	}

	getItem(key: string): string | null {
		return this.#store.get(key) ?? null
	}

	key(index: number): string | null {
		return [...this.#store.keys()][index] ?? null
	}

	removeItem(key: string): void {
		this.#store.delete(key)
	}

	setItem(key: string, value: string): void {
		this.#store.set(key, value)
	}
}

const installStorage = () => {
	vi.stubGlobal('localStorage', new MemoryStorage())
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('FX cache persistence', () => {
	it('normalizes invalid cache payloads', () => {
		const normalized = normalizeFxRateCacheState({
			baseCurrency: 'USD',
			provider: '',
			version: Number.NaN,
			updatedAt: '',
			rates: {
				usd: {
					'2026-01-10': 35,
					'2026-01-11': 0,
				},
				eur: {
					'2026-01-12': -1,
				},
			},
		} as unknown as FxRateCacheState)

		expect(normalized).toEqual({
			...createEmptyFxRateCacheState(),
			rates: {
				USD: {
					'2026-01-10': 35,
				},
			},
		})
	})

	it('persists rates in localStorage by default', async () => {
		installStorage()

		const cache: FxRateCacheState = {
			baseCurrency: 'THB',
			provider: 'frankfurter',
			version: 1,
			updatedAt: '2026-03-08T00:00:00.000Z',
			rates: {
				USD: {
					'2026-01-15': 35.5,
				},
			},
		}

		await writeFxRateCache(cache)
		expect(await readFxRateCache()).toEqual(cache)

		await clearFxRateCache()
		expect(await readFxRateCache()).toEqual(createEmptyFxRateCacheState())
	})
})
