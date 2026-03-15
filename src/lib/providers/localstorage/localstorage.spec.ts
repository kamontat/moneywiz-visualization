import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { LocalStorageProvider } from '.'

interface MockStorageEvent {
	type: string
	key: string | null
	newValue: string | null
}

class MockWindow {
	private listeners = new Map<string, Set<(event: MockStorageEvent) => void>>()

	addEventListener(type: string, fn: (event: MockStorageEvent) => void): void {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set())
		this.listeners.get(type)!.add(fn)
	}

	dispatchEvent(event: MockStorageEvent): void {
		const fns = this.listeners.get(event.type)
		if (fns) fns.forEach((fn) => fn(event))
	}
}

class MemoryStorage implements Storage {
	private store = new Map<string, string>()

	get length(): number {
		return this.store.size
	}

	clear(): void {
		this.store.clear()
	}

	getItem(key: string): string | null {
		return this.store.get(key) ?? null
	}

	setItem(key: string, value: string): void {
		this.store.set(key, value)
	}

	removeItem(key: string): void {
		this.store.delete(key)
	}

	key(index: number): string | null {
		return Array.from(this.store.keys())[index] ?? null
	}
}

describe('LocalStorageProvider', () => {
	let storage: MemoryStorage
	let mockWindow: MockWindow
	let provider: LocalStorageProvider

	beforeEach(() => {
		storage = new MemoryStorage()
		mockWindow = new MockWindow()
		vi.stubGlobal('localStorage', storage)
		vi.stubGlobal('window', mockWindow)
		provider = new LocalStorageProvider()
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	describe('table', () => {
		it('returns the same table instance for the same name', () => {
			const t1 = provider.table('test')
			const t2 = provider.table('test')
			expect(t1).toBe(t2)
		})

		it('returns different table instances for different names', () => {
			const t1 = provider.table('a')
			const t2 = provider.table('b')
			expect(t1).not.toBe(t2)
		})
	})

	describe('LocalStorageTable', () => {
		it('get returns undefined for missing key', () => {
			const table = provider.table('t')
			expect(table.get('missing')).toBeUndefined()
		})

		it('set and get round-trips a value', () => {
			const table = provider.table('t')
			table.set('key', { name: 'test', count: 42 })
			expect(table.get('key')).toEqual({ name: 'test', count: 42 })
		})

		it('namespaces keys by table name', () => {
			const t1 = provider.table('alpha')
			const t2 = provider.table('beta')
			t1.set('key', 'from-alpha')
			t2.set('key', 'from-beta')
			expect(t1.get('key')).toBe('from-alpha')
			expect(t2.get('key')).toBe('from-beta')
		})

		it('delete removes a key', () => {
			const table = provider.table('t')
			table.set('key', 'value')
			table.delete('key')
			expect(table.get('key')).toBeUndefined()
		})

		it('clear removes all keys in the table', () => {
			const table = provider.table('t')
			table.set('a', 1)
			table.set('b', 2)
			table.clear()
			expect(table.get('a')).toBeUndefined()
			expect(table.get('b')).toBeUndefined()
		})

		it('clear does not affect other tables', () => {
			const t1 = provider.table('one')
			const t2 = provider.table('two')
			t1.set('key', 'keep')
			t2.set('key', 'remove')
			t2.clear()
			expect(t1.get('key')).toBe('keep')
		})

		it('keys returns all keys in the table', () => {
			const table = provider.table('t')
			table.set('x', 1)
			table.set('y', 2)
			expect(table.keys().sort()).toEqual(['x', 'y'])
		})

		it('keys does not include keys from other tables', () => {
			const t1 = provider.table('a')
			const t2 = provider.table('b')
			t1.set('k1', 1)
			t2.set('k2', 2)
			expect(t1.keys()).toEqual(['k1'])
		})

		it('get returns undefined for malformed JSON', () => {
			storage.setItem('t:broken', '{not-json')
			const table = provider.table('t')
			expect(table.get('broken')).toBeUndefined()
		})
	})

	describe('onChange', () => {
		it('fires callback when storage event matches key', () => {
			const table = provider.table('t')
			const callback = vi.fn()
			table.onChange('key', callback)

			mockWindow.dispatchEvent({
				type: 'storage',
				key: 't:key',
				newValue: JSON.stringify({ updated: true }),
			})

			expect(callback).toHaveBeenCalledWith({ updated: true })
		})

		it('does not fire for different keys', () => {
			const table = provider.table('t')
			const callback = vi.fn()
			table.onChange('key', callback)

			mockWindow.dispatchEvent({
				type: 'storage',
				key: 't:other',
				newValue: '"value"',
			})

			expect(callback).not.toHaveBeenCalled()
		})

		it('fires with undefined when value is null (deletion)', () => {
			const table = provider.table('t')
			const callback = vi.fn()
			table.onChange('key', callback)

			mockWindow.dispatchEvent({
				type: 'storage',
				key: 't:key',
				newValue: null,
			})

			expect(callback).toHaveBeenCalledWith(undefined)
		})

		it('fires with undefined for malformed JSON in event', () => {
			const table = provider.table('t')
			const callback = vi.fn()
			table.onChange('key', callback)

			mockWindow.dispatchEvent({
				type: 'storage',
				key: 't:key',
				newValue: '{bad-json',
			})

			expect(callback).toHaveBeenCalledWith(undefined)
		})
	})
})
