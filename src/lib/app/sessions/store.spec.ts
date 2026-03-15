import { get } from 'svelte/store'
import { describe, expect, it } from 'vitest'

import {
	createSessionStore,
	createFilterStore,
	createFilterOptionsStore,
	createAnalyticsStore,
	createBootstrapProgressStore,
	createUploadProgressStore,
	deriveStatus,
	deriveTransactionCount,
	deriveHasData,
} from './store'

describe('createSessionStore', () => {
	it('starts with idle status and zero transactions', () => {
		const store = createSessionStore()
		const state = get(store)
		expect(state.status).toBe('idle')
		expect(state.transactionCount).toBe(0)
	})

	it('set replaces state', () => {
		const store = createSessionStore()
		store.set({
			status: 'ready',
			transactionCount: 42,
			backend: 'opfs',
		})
		const state = get(store)
		expect(state.status).toBe('ready')
		expect(state.transactionCount).toBe(42)
		expect(state.backend).toBe('opfs')
	})

	it('patch merges partial state', () => {
		const store = createSessionStore()
		store.patch({ status: 'loading' })
		expect(get(store).status).toBe('loading')
		expect(get(store).transactionCount).toBe(0)
	})

	it('reset returns to initial state', () => {
		const store = createSessionStore()
		store.set({
			status: 'ready',
			transactionCount: 100,
			backend: 'snapshot',
		})
		store.reset()
		const state = get(store)
		expect(state.status).toBe('idle')
		expect(state.transactionCount).toBe(0)
		expect(state.backend).toBeUndefined()
	})
})

describe('createFilterStore', () => {
	it('starts empty', () => {
		const store = createFilterStore()
		const state = get(store)
		expect(state.transactionTypes).toEqual([])
		expect(state.categories).toEqual([])
		expect(state.payees).toEqual([])
		expect(state.accounts).toEqual([])
		expect(state.tags).toEqual([])
		expect(state.dateRange).toBeUndefined()
	})
})

describe('createFilterOptionsStore', () => {
	it('starts empty', () => {
		const store = createFilterOptionsStore()
		const state = get(store)
		expect(state.categories).toEqual([])
		expect(state.transactionTypes).toEqual([])
	})
})

describe('createAnalyticsStore', () => {
	it('starts zeroed', () => {
		const store = createAnalyticsStore()
		const state = get(store)
		expect(state.income).toBe(0)
		expect(state.expense).toBe(0)
		expect(state.net).toBe(0)
		expect(state.savingsRate).toBe(0)
		expect(state.transactionCount).toBe(0)
	})
})

describe('createBootstrapProgressStore', () => {
	it('starts null', () => {
		const store = createBootstrapProgressStore()
		expect(get(store)).toBeNull()
	})
})

describe('createUploadProgressStore', () => {
	it('starts null', () => {
		const store = createUploadProgressStore()
		expect(get(store)).toBeNull()
	})
})

describe('deriveStatus', () => {
	it('derives status from session store', () => {
		const session = createSessionStore()
		const status = deriveStatus(session)
		expect(get(status)).toBe('idle')

		session.patch({ status: 'ready' })
		expect(get(status)).toBe('ready')
	})
})

describe('deriveTransactionCount', () => {
	it('derives count from session store', () => {
		const session = createSessionStore()
		const count = deriveTransactionCount(session)
		expect(get(count)).toBe(0)

		session.patch({ transactionCount: 50 })
		expect(get(count)).toBe(50)
	})
})

describe('deriveHasData', () => {
	it('returns false when idle', () => {
		const session = createSessionStore()
		const hasData = deriveHasData(session)
		expect(get(hasData)).toBe(false)
	})

	it('returns false when ready but zero transactions', () => {
		const session = createSessionStore()
		session.patch({ status: 'ready', transactionCount: 0 })
		const hasData = deriveHasData(session)
		expect(get(hasData)).toBe(false)
	})

	it('returns true when ready with transactions', () => {
		const session = createSessionStore()
		session.set({ status: 'ready', transactionCount: 10 })
		const hasData = deriveHasData(session)
		expect(get(hasData)).toBe(true)
	})
})
