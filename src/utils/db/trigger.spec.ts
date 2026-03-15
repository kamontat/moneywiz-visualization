import type { ISchemaDB, ISchemaState, ISchemaTable } from './models'
import type { TriggerContext } from './trigger'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MemoryStorage } from './__tests__/test-helpers'
import { fireTrigger, listenForChanges, listenForChangesByKey } from './trigger'

import { Log } from '$lib/loggers/models'

type TestTableSchema = ISchemaTable<
	'items',
	[ISchemaState<string, { name: string; count: number }>]
>

type TestSchema = ISchemaDB<{
	'v1:test-db': [TestTableSchema]
}>

describe('fireTrigger', () => {
	let mockLocalStorage: Storage
	let ctx: TriggerContext<'v1:test-db', TestSchema['v1:test-db']>

	beforeEach(() => {
		mockLocalStorage = new MemoryStorage()
		vi.stubGlobal('localStorage', mockLocalStorage)

		ctx = {
			name: 'test-db',
			version: 1,
			triggerName: 'trigger-test',
			log: Log.root.extends('test'),
			readValue: vi.fn().mockResolvedValue(undefined),
		}
	})

	it('should set trigger data in localStorage with correct key format', () => {
		fireTrigger(ctx, 'set', 'items', 'item-1', 'value-data')

		expect(mockLocalStorage.getItem('trigger-test:items:item-1')).toBe(
			JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-1',
				action: 'set',
				value: 'value-data',
			})
		)
	})

	it('should fire trigger with delete action', () => {
		fireTrigger(ctx, 'delete', 'items', 'item-2', 'removed')

		const stored = mockLocalStorage.getItem('trigger-test:items:item-2')
		expect(stored).toBeTruthy()

		const data = JSON.parse(stored!)
		expect(data.action).toBe('delete')
		expect(data.key).toBe('item-2')
	})

	it('should include db name and version in trigger data', () => {
		fireTrigger(ctx, 'set', 'items', 'item-3', 'test-value')

		const stored = mockLocalStorage.getItem('trigger-test:items:item-3')
		const data = JSON.parse(stored!)

		expect(data.db).toBe('test-db')
		expect(data.version).toBe(1)
	})

	it('should construct trigger key with triggerName, table, and key', () => {
		const setItemSpy = vi.spyOn(mockLocalStorage, 'setItem')

		fireTrigger(ctx, 'set', 'items', 'item-4', 'data')

		expect(setItemSpy).toHaveBeenCalledWith(
			'trigger-test:items:item-4',
			expect.any(String)
		)
	})
})

describe('listenForChanges', () => {
	let mockLocalStorage: Storage
	let mockAddEventListener: ReturnType<typeof vi.fn>
	let ctx: TriggerContext<'v1:test-db', TestSchema['v1:test-db']>
	let MockStorageEvent: typeof StorageEvent

	beforeEach(() => {
		mockLocalStorage = new MemoryStorage()
		mockAddEventListener = vi.fn()

		MockStorageEvent = class extends Event {
			key: string | null
			newValue: string | null

			constructor(type: string, init?: { key?: string; newValue?: string }) {
				super(type)
				this.key = init?.key ?? null
				this.newValue = init?.newValue ?? null
			}
		} as any

		vi.stubGlobal('localStorage', mockLocalStorage)
		vi.stubGlobal('window', {
			localStorage: mockLocalStorage,
			addEventListener: mockAddEventListener,
		})

		ctx = {
			name: 'test-db',
			version: 1,
			triggerName: 'trigger-test',
			log: Log.root.extends('test'),
			readValue: vi.fn().mockResolvedValue({ name: 'test', count: 10 }),
		}
	})

	it('should register storage event listener', () => {
		const callback = vi.fn()

		listenForChanges(ctx, callback)

		expect(mockAddEventListener).toHaveBeenCalledWith(
			'storage',
			expect.any(Function)
		)
	})

	it('should invoke callback when storage event key starts with triggerName', () => {
		const callback = vi.fn()

		listenForChanges(ctx, callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]
		expect(listener).toBeDefined()

		const event = new MockStorageEvent('storage', {
			key: 'trigger-test:items:item-1',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-1',
				action: 'set',
				value: 'data',
			}),
		})

		listener(event)

		expect(callback).toHaveBeenCalledWith(event, expect.any(Object))
	})

	it('should not invoke callback when event key does not match triggerName', () => {
		const callback = vi.fn()

		listenForChanges(ctx, callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]
		const event = new MockStorageEvent('storage', {
			key: 'other-prefix:items:item-1',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-1',
				action: 'set',
				value: 'data',
			}),
		})

		listener(event)

		expect(callback).not.toHaveBeenCalled()
	})

	it('should parse changed data and attach read function', () => {
		const callback = vi.fn()

		listenForChanges(ctx, callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]
		const event = new MockStorageEvent('storage', {
			key: 'trigger-test:items:item-5',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-5',
				action: 'set',
				value: 'test-data',
			}),
		})

		listener(event)

		expect(callback).toHaveBeenCalledWith(
			event,
			expect.objectContaining({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-5',
				action: 'set',
				value: 'test-data',
				read: expect.any(Function),
			})
		)
	})

	it('should invoke callback with undefined when newValue is null', () => {
		const callback = vi.fn()

		listenForChanges(ctx, callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]
		const event = new MockStorageEvent('storage', {
			key: 'trigger-test:items:item-6',
			newValue: undefined,
		})

		listener(event)

		expect(callback).toHaveBeenCalledWith(event, undefined)
	})

	it('should invoke callback with undefined when newValue is invalid JSON', () => {
		const callback = vi.fn()

		listenForChanges(ctx, callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]
		const event = new MockStorageEvent('storage', {
			key: 'trigger-test:items:item-7',
			newValue: 'invalid-json-data',
		})

		listener(event)

		expect(callback).toHaveBeenCalledWith(event, undefined)
	})
})

describe('listenForChangesByKey', () => {
	let mockLocalStorage: Storage
	let mockAddEventListener: ReturnType<typeof vi.fn>
	let ctx: TriggerContext<'v1:test-db', TestSchema['v1:test-db']>
	let MockStorageEvent: typeof StorageEvent

	beforeEach(() => {
		mockLocalStorage = new MemoryStorage()
		mockAddEventListener = vi.fn()

		MockStorageEvent = class extends Event {
			key: string | null
			newValue: string | null

			constructor(type: string, init?: { key?: string; newValue?: string }) {
				super(type)
				this.key = init?.key ?? null
				this.newValue = init?.newValue ?? null
			}
		} as any

		vi.stubGlobal('localStorage', mockLocalStorage)
		vi.stubGlobal('window', {
			localStorage: mockLocalStorage,
			addEventListener: mockAddEventListener,
		})

		ctx = {
			name: 'test-db',
			version: 1,
			triggerName: 'trigger-test',
			log: Log.root.extends('test'),
			readValue: vi.fn().mockResolvedValue({ name: 'test', count: 10 }),
		}
	})

	it('should register storage event listener via listenForChanges', () => {
		const callback = vi.fn()

		listenForChangesByKey(ctx, 'items', 'item-1', callback)

		expect(mockAddEventListener).toHaveBeenCalledWith(
			'storage',
			expect.any(Function)
		)
	})

	it('should invoke callback only when table and key match', () => {
		const callback = vi.fn()

		listenForChangesByKey(ctx, 'items', 'item-1', callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]

		const matchingEvent = new MockStorageEvent('storage', {
			key: 'trigger-test:items:item-1',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-1',
				action: 'set',
				value: 'data',
			}),
		})

		listener(matchingEvent)

		expect(callback).toHaveBeenCalledWith(matchingEvent, expect.any(Object))
	})

	it('should not invoke callback when table does not match', () => {
		const callback = vi.fn()

		listenForChangesByKey(ctx, 'items', 'item-1', callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]

		const nonMatchingEvent = new MockStorageEvent('storage', {
			key: 'trigger-test:other-table:item-1',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'other-table',
				key: 'item-1',
				action: 'set',
				value: 'data',
			}),
		})

		listener(nonMatchingEvent)

		expect(callback).not.toHaveBeenCalled()
	})

	it('should not invoke callback when key does not match', () => {
		const callback = vi.fn()

		listenForChangesByKey(ctx, 'items', 'item-1', callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]

		const nonMatchingEvent = new MockStorageEvent('storage', {
			key: 'trigger-test:items:item-2',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-2',
				action: 'set',
				value: 'data',
			}),
		})

		listener(nonMatchingEvent)

		expect(callback).not.toHaveBeenCalled()
	})

	it('should filter by both table and key simultaneously', () => {
		const callback = vi.fn()

		listenForChangesByKey(ctx, 'items', 'item-5', callback)

		const listener = mockAddEventListener.mock.calls[0]?.[1]

		const matchingEvent = new MockStorageEvent('storage', {
			key: 'trigger-test:items:item-5',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-5',
				action: 'set',
				value: 'data',
			}),
		})

		listener(matchingEvent)
		expect(callback).toHaveBeenCalledTimes(1)

		const wrongTableEvent = new MockStorageEvent('storage', {
			key: 'trigger-test:other:item-5',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'other',
				key: 'item-5',
				action: 'set',
				value: 'data',
			}),
		})

		listener(wrongTableEvent)
		expect(callback).toHaveBeenCalledTimes(1)

		const wrongKeyEvent = new MockStorageEvent('storage', {
			key: 'trigger-test:items:item-6',
			newValue: JSON.stringify({
				db: 'test-db',
				version: 1,
				table: 'items',
				key: 'item-6',
				action: 'set',
				value: 'data',
			}),
		})

		listener(wrongKeyEvent)
		expect(callback).toHaveBeenCalledTimes(1)
	})
})
