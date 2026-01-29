import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createStore } from './store'
import type { StoreState } from './models'
import { get } from 'svelte/store'

const { mockStoreLogger, mockLocalStorageLogger } = vi.hoisted(() => {
	return {
		mockStoreLogger: {
			debug: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		},
		mockLocalStorageLogger: {
			debug: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
		},
	}
})

// Mock logger
vi.mock('$lib/loggers', () => ({
	store: mockStoreLogger,
	localStorage: mockLocalStorageLogger,
}))

const TEST_KEY = 'TEST'
const testFactory = {
	emptyState: { type: TEST_KEY, data: { count: 0 } },
	normalize: (val: any) => ({
		type: TEST_KEY,
		data: { count: val?.data?.count ?? 0 },
	}),
}

describe('createStore', () => {
	beforeEach(() => {
		vi.unstubAllGlobals()
		// Default to no window
		vi.stubGlobal('window', undefined)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.clearAllMocks()
	})

	it('should create a store with empty state when no window', () => {
		const store = createStore(TEST_KEY, testFactory)
		expect(get(store)).toEqual(testFactory.emptyState)
	})

	it('should hydrate from localStorage if window exists', () => {
		const savedState = { type: TEST_KEY, data: { count: 42 } }
		const mockGetItem = vi.fn().mockReturnValue(JSON.stringify(savedState))

		vi.stubGlobal('window', {
			localStorage: {
				getItem: mockGetItem,
			},
		})

		const store = createStore(TEST_KEY, testFactory)
		expect(get(store)).toEqual(savedState)
		expect(mockGetItem).toHaveBeenCalledWith(TEST_KEY)
	})

	it('should use empty state if localStorage returns null', () => {
		const mockGetItem = vi.fn().mockReturnValue(null)

		vi.stubGlobal('window', {
			localStorage: {
				getItem: mockGetItem,
			},
		})

		const store = createStore(TEST_KEY, testFactory)
		expect(get(store)).toEqual(testFactory.emptyState)
	})

	it('should handle invalid JSON in localStorage', () => {
		const mockGetItem = vi.fn().mockReturnValue('{ invalid json')

		vi.stubGlobal('window', {
			localStorage: {
				getItem: mockGetItem,
			},
		})

		const store = createStore(TEST_KEY, testFactory)
		// Should fall back to empty state or normalized state of parsed partial?
		// The code does: JSON.parse(raw ?? '') which throws on invalid json
		// Then catch block returns undefined.
		// Then normalize({ ...emptyState, ...undefined }) -> normalize(emptyState) -> emptyState

		expect(get(store)).toEqual(testFactory.emptyState)
	})

	it('should persist to localStorage on set', () => {
		const mockSetItem = vi.fn()
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn(),
				setItem: mockSetItem,
				removeItem: vi.fn(),
			},
		})

		const store = createStore(TEST_KEY, testFactory)
		const newState = { type: TEST_KEY, data: { count: 10 } }

		store.set(newState)

		expect(get(store)).toEqual(newState)
		expect(mockSetItem).toHaveBeenCalledWith(TEST_KEY, JSON.stringify(newState))
	})

	it('should persist to localStorage on update', () => {
		const mockSetItem = vi.fn()
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn(),
				setItem: mockSetItem,
				removeItem: vi.fn(),
			},
		})

		const store = createStore(TEST_KEY, testFactory)

		store.update((state) => ({
			...state,
			data: { count: state.data.count + 1 },
		}))

		const expected = { type: TEST_KEY, data: { count: 1 } }
		expect(get(store)).toEqual(expected)
		expect(mockSetItem).toHaveBeenCalledWith(TEST_KEY, JSON.stringify(expected))
	})

	it('should reset to empty state', () => {
		const mockSetItem = vi.fn()
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn(),
				setItem: mockSetItem,
				removeItem: vi.fn(),
			},
		})

		const store = createStore(TEST_KEY, testFactory)
		store.set({ type: TEST_KEY, data: { count: 5 } })

		store.reset()

		expect(get(store)).toEqual(testFactory.emptyState)
		// reset does setLocalStorage(key, factory.emptyState)
		expect(mockSetItem).toHaveBeenLastCalledWith(TEST_KEY, JSON.stringify(testFactory.emptyState))
	})

	it('should log on subscribe', () => {
		const store = createStore(TEST_KEY, testFactory)
		const unsubscribe = store.subscribe(() => {})
		expect(mockStoreLogger.debug).toHaveBeenCalledWith('subscribing to store: %s', TEST_KEY)
		unsubscribe()
	})

	it('should handle localStorage setItem error', () => {
		const mockSetItem = vi.fn().mockImplementation(() => {
			throw new Error('QuotaExceeded')
		})
		const mockRemoveItem = vi.fn()

		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn(),
				setItem: mockSetItem,
				removeItem: mockRemoveItem,
			},
		})

		const store = createStore(TEST_KEY, testFactory)
		// Should not throw
		expect(() => store.set({ type: TEST_KEY, data: { count: 1 } })).not.toThrow()
	})

	it('should remove from localStorage if value is undefined (edge case for setLocalStorage)', () => {
		// Technically createStore's set/update calls normalize which returns a value,
		// so value is never undefined in those paths.
		// However, we can test setLocalStorage directly if we exported it, but we didn't.
		// But we can reach the branch implicitly?
		// createStore calls setLocalStorage(key, next). 'next' comes from normalize.
		// If normalize returns undefined? (Types say StoreState, so shouldn't)
		// Check `setLocalStorage` impl: if (value === undefined) removeItem
		// We can't easily trigger this from public API unless factory returns undefined.
		// Let's coerce it for coverage if needed.

		const factoryReturningUndefined = {
			emptyState: { type: TEST_KEY, data: { count: 0 } },
			normalize: () => undefined as any,
		}

		const mockRemoveItem = vi.fn()
		vi.stubGlobal('window', {
			localStorage: {
				getItem: vi.fn(),
				setItem: vi.fn(),
				removeItem: mockRemoveItem,
			},
		})

		const store = createStore(TEST_KEY, factoryReturningUndefined)
		store.set({} as any)

		expect(mockRemoveItem).toHaveBeenCalledWith(TEST_KEY)
	})
})
