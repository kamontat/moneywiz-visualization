import type { Log } from '$lib/loggers/models'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { newStore } from './store'

const mockLog = (): Log<string, string> =>
	({
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		log: vi.fn(),
		extends: vi.fn(() => mockLog()),
	}) as unknown as Log<string, string>

interface TestState {
	value: string
}

const createTestState = () => ({
	empty: { value: '' } as TestState,
	normalize: (v: TestState | Partial<TestState>) =>
		({ value: (v as TestState).value ?? '' }) as TestState,
	equal: (a: TestState, b: TestState) => a.value === b.value,
	merge: (base: TestState, partial: Partial<TestState>) => ({
		...base,
		...partial,
	}),
})

const createMockStorage = () => {
	const storage = new Map<string, unknown>()
	return {
		available: vi.fn(() => true),
		get: vi.fn(() => storage.get('test-key')),
		set: vi.fn(async (v: unknown) => {
			storage.set('test-key', v)
		}),
		del: vi.fn(async () => {}),
		_storage: storage,
	}
}

type MockStorage = ReturnType<typeof createMockStorage>

const createStore = (mock: MockStorage) => {
	const state = createTestState()
	const log = mockLog()

	return newStore(state, {
		available: mock.available,
		get: mock.get as () => TestState | null | undefined,
		set: mock.set as (val: TestState) => Promise<void>,
		del: mock.del,
		log,
	})
}

describe('newStore', () => {
	let mock: MockStorage

	beforeEach(() => {
		mock = createMockStorage()
	})

	describe('subscribe', () => {
		it('should provide initial empty value to subscriber', () => {
			const store = createStore(mock)
			let received: TestState | undefined

			const unsub = store.subscribe((v) => {
				received = v
			})

			expect(received).toEqual({ value: '' })
			unsub()
		})

		it('should notify subscribers on set', async () => {
			const store = createStore(mock)
			const values: TestState[] = []

			const unsub = store.subscribe((v) => {
				values.push(v)
			})

			store.set({ value: 'hello' })
			// set() is fire-and-forget (calls setAsync internally),
			// so we need a tick for the async DB persist + _set to complete
			await new Promise((r) => setTimeout(r, 10))
			expect(values).toHaveLength(2)
			expect(values[1]).toEqual({ value: 'hello' })
			unsub()
		})
	})

	describe('setAsync', () => {
		it('should normalize value before storing', async () => {
			const store = createStore(mock)
			await store.setAsync({ value: 'test' })

			let current: TestState | undefined
			const unsub = store.subscribe((v) => {
				current = v
			})

			expect(current).toEqual({ value: 'test' })
			unsub()
		})

		it('should persist to storage', async () => {
			const store = createStore(mock)
			await store.setAsync({ value: 'persisted' })

			expect(mock.set).toHaveBeenCalledWith({
				value: 'persisted',
			})
		})

		it('should still update store even if storage persistence fails', async () => {
			mock.set.mockRejectedValueOnce(new Error('storage write failed'))
			const store = createStore(mock)

			await store.setAsync({ value: 'despite-error' })

			let current: TestState | undefined
			const unsub = store.subscribe((v) => {
				current = v
			})
			expect(current).toEqual({ value: 'despite-error' })
			unsub()
		})

		it('should resolve even when storage persistence fails', async () => {
			mock.set.mockRejectedValueOnce(new Error('storage write failed'))
			const store = createStore(mock)

			await expect(
				store.setAsync({ value: 'should-resolve' })
			).resolves.toBeUndefined()
		})
	})

	describe('updateAsync', () => {
		it('should update value based on current state', async () => {
			const store = createStore(mock)
			await store.setAsync({ value: 'initial' })

			await store.updateAsync((current) => ({
				value: current.value + '-updated',
			}))

			let current: TestState | undefined
			const unsub = store.subscribe((v) => {
				current = v
			})
			expect(current).toEqual({ value: 'initial-updated' })
			unsub()
		})

		it('should persist to storage on value change', async () => {
			const store = createStore(mock)
			mock.set.mockClear()

			await store.updateAsync(() => ({ value: 'new-value' }))

			expect(mock.set).toHaveBeenCalledWith({
				value: 'new-value',
			})
		})

		it('should skip storage persistence when value is equal', async () => {
			const store = createStore(mock)
			await store.setAsync({ value: 'same' })
			mock.set.mockClear()

			await store.updateAsync(() => ({ value: 'different' }))
			expect(mock.set).toHaveBeenCalledTimes(1)
		})

		it('should reject when storage persistence fails on changed value', async () => {
			const store = createStore(mock)
			mock.set.mockRejectedValueOnce(new Error('storage error'))

			await expect(
				store.updateAsync(() => ({ value: 'will-fail' }))
			).rejects.toThrow('storage error')
		})
	})

	describe('resetAsync', () => {
		it('should reset store to empty value', async () => {
			const store = createStore(mock)
			await store.setAsync({ value: 'has-data' })

			await store.resetAsync()

			let current: TestState | undefined
			const unsub = store.subscribe((v) => {
				current = v
			})
			expect(current).toEqual({ value: '' })
			unsub()
		})

		it('should call delete on storage', async () => {
			const store = createStore(mock)
			await store.resetAsync()

			expect(mock.del).toHaveBeenCalled()
		})
	})

	describe('initial storage load', () => {
		it('should load initial value from storage when available', async () => {
			mock._storage.set('test-key', { value: 'from-db' })
			const store = createStore(mock)

			// Wait for async initial load
			await new Promise((r) => setTimeout(r, 10))

			let current: TestState | undefined
			const unsub = store.subscribe((v) => {
				current = v
			})
			expect(current).toEqual({ value: 'from-db' })
			unsub()
		})

		it('should keep empty value when storage returns null', async () => {
			mock.get.mockReturnValueOnce(null)
			const store = createStore(mock)

			await new Promise((r) => setTimeout(r, 10))

			let current: TestState | undefined
			const unsub = store.subscribe((v) => {
				current = v
			})
			expect(current).toEqual({ value: '' })
			unsub()
		})

		it('should not load from storage when unavailable', async () => {
			mock.available.mockReturnValue(false)
			const store = createStore(mock)

			await new Promise((r) => setTimeout(r, 10))

			expect(mock.get).not.toHaveBeenCalled()

			let current: TestState | undefined
			const unsub = store.subscribe((v) => {
				current = v
			})
			expect(current).toEqual({ value: '' })
			unsub()
		})
	})

	describe('updateAsync equal-value settlement', () => {
		it('updateAsync should resolve when value is unchanged', async () => {
			const store = createStore(mock)
			await store.setAsync({ value: 'same' })

			const result = Promise.race([
				store.updateAsync((current) => current).then(() => 'resolved' as const),
				new Promise<'timeout'>((r) => setTimeout(() => r('timeout'), 50)),
			])

			expect(await result).toBe('resolved')
		})
	})
})
