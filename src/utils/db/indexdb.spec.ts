import type { IDBPDatabase, OpenDBCallbacks } from 'idb'
import type {
	ISchemaDB,
	ISchemaState,
	ISchemaTable,
	ToIDBSchema,
} from './models'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { IndexDB } from './indexdb'

const { openDBMock, browserEnv } = vi.hoisted(() => ({
	openDBMock: vi.fn(),
	browserEnv: { value: true },
}))

vi.mock('idb', () => ({
	openDB: openDBMock,
}))

vi.mock('$app/environment', () => ({
	get browser() {
		return browserEnv.value
	},
}))

type UserTableSchema = ISchemaTable<
	'users',
	[ISchemaState<string, { name: string; age: number }>]
>

type PostTableSchema = ISchemaTable<
	'posts',
	[ISchemaState<string, { title: string; content: string }>]
>

type TestSchema = ISchemaDB<{
	'v1:test-db': [UserTableSchema, PostTableSchema]
	'v2:test-db': [UserTableSchema, PostTableSchema]
	'v2:my-store': [UserTableSchema, PostTableSchema]
}>

describe('IndexDB', () => {
	let mockDB: IDBPDatabase<ToIDBSchema<TestSchema['v1:test-db']>>
	let mockLocalStorage: Storage

	beforeEach(() => {
		vi.clearAllMocks()
		browserEnv.value = true

		const storage = new Map<string, string>()
		mockLocalStorage = {
			getItem: vi.fn((key: string) => storage.get(key) ?? null),
			setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
			removeItem: vi.fn((key: string) => storage.delete(key)),
			clear: vi.fn(() => storage.clear()),
			get length() {
				return storage.size
			},
			key: vi.fn((index: number) => {
				const keys = Array.from(storage.keys())
				return keys[index] ?? null
			}),
		}

		vi.stubGlobal('localStorage', mockLocalStorage)
		vi.stubGlobal('window', {
			localStorage: mockLocalStorage,
			indexedDB: {},
			addEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})

		mockDB = {
			get: vi.fn().mockResolvedValue(undefined),
			put: vi.fn().mockResolvedValue(undefined),
			delete: vi.fn().mockResolvedValue(undefined),
			clear: vi.fn().mockResolvedValue(undefined),
			getAll: vi.fn().mockResolvedValue([]),
			getAllKeys: vi.fn().mockResolvedValue([]),
			transaction: vi.fn().mockReturnValue({
				store: {
					get: vi.fn().mockResolvedValue(undefined),
					put: vi.fn().mockResolvedValue(undefined),
					delete: vi.fn().mockResolvedValue(undefined),
				},
				done: Promise.resolve(),
			}),
			close: vi.fn(),
		} as any

		openDBMock.mockResolvedValue(mockDB)
	})

	describe('create()', () => {
		it('creates IndexDB instance with parsed name and version', async () => {
			const callbacks: OpenDBCallbacks<ToIDBSchema<TestSchema['v1:test-db']>> =
				{
					upgrade: vi.fn(),
				}

			const db = IndexDB.create<TestSchema, 'v1:test-db'>(
				'v1:test-db',
				callbacks
			)

			expect(db).toBeInstanceOf(IndexDB)
			expect(db.name).toBe('test-db')
			expect(db.version).toBe(1)
			expect(db.type).toBe('indexdb')
			expect(openDBMock).toHaveBeenCalledWith('test-db', 1, callbacks)
		})

		it('returns empty DB when not in browser environment', async () => {
			vi.clearAllMocks()
			browserEnv.value = false

			const callbacks: OpenDBCallbacks<ToIDBSchema<TestSchema['v1:test-db']>> =
				{
					upgrade: vi.fn(),
				}

			vi.resetModules()
			const { IndexDB: IndexDBReimport } = await import('./indexdb')
			const db = IndexDBReimport.create<TestSchema, 'v1:test-db'>(
				'v1:test-db',
				callbacks
			)

			expect(db.name).toBe('v0:empty-db')
			expect(db.available()).toBe(false)
			expect(openDBMock).not.toHaveBeenCalled()
		})

		it('sets triggerName based on type and name', () => {
			const callbacks: OpenDBCallbacks<ToIDBSchema<TestSchema['v2:my-store']>> =
				{
					upgrade: vi.fn(),
				}

			const db = IndexDB.create<TestSchema, 'v2:my-store'>(
				'v2:my-store',
				callbacks
			)

			expect(db.triggerName).toBe('indexdb-trigger:my-store')
		})
	})

	describe('available()', () => {
		it('returns true when in browser with localStorage and indexedDB', () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			expect(db.available()).toBe(true)
		})

		it('returns false when window is undefined', () => {
			vi.stubGlobal('window', undefined)

			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			expect(db.available()).toBe(false)
		})

		it('returns false when localStorage is undefined', () => {
			vi.stubGlobal('window', {
				indexedDB: {},
			})

			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			expect(db.available()).toBe(false)
		})

		it('returns false when indexedDB is undefined', () => {
			vi.stubGlobal('window', {
				localStorage: {},
			})

			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			expect(db.available()).toBe(false)
		})
	})

	describe('get()', () => {
		it('retrieves value from database', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const mockValue = { name: 'John', age: 30 }
			mockDB.get = vi.fn().mockResolvedValue(mockValue)

			const result = await db.get('users', 'user-1')

			expect(mockDB.get).toHaveBeenCalledWith('users', 'user-1')
			expect(result).toEqual(mockValue)
		})

		it('returns undefined when key not found', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			mockDB.get = vi.fn().mockResolvedValue(undefined)

			const result = await db.get('users', 'non-existent')

			expect(result).toBeUndefined()
		})
	})

	describe('set()', () => {
		it('stores value in database', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const value = { name: 'Alice', age: 25 }
			await db.set('users', 'user-2', value)

			expect(mockDB.put).toHaveBeenCalledWith('users', value, 'user-2')
		})

		it('handles update of existing key', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const value = { name: 'Bob', age: 35 }
			await db.set('users', 'user-1', value)

			expect(mockDB.put).toHaveBeenCalledWith('users', value, 'user-1')
		})
	})

	describe('delete()', () => {
		it('deletes single key from table', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			await db.delete('users', 'user-1')

			expect(mockDB.delete).toHaveBeenCalledWith('users', 'user-1')
		})

		it('clears entire table when key omitted and returns keys', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			mockDB.getAllKeys = vi
				.fn()
				.mockResolvedValue(['user-1', 'user-2', 'user-3'])

			const result = await db.delete('users')

			expect(mockDB.getAllKeys).toHaveBeenCalledWith('users')
			expect(mockDB.clear).toHaveBeenCalledWith('users')
			expect(result).toEqual(['user-1', 'user-2', 'user-3'])
		})

		it('returns empty array when clearing empty table', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			mockDB.getAllKeys = vi.fn().mockResolvedValue([])

			const result = await db.delete('posts')

			expect(result).toEqual([])
		})
	})

	describe('transaction()', () => {
		it('creates transaction for single store', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const mockTx = { store: {}, done: Promise.resolve() }
			mockDB.transaction = vi.fn().mockReturnValue(mockTx)

			const tx = await db.transaction('users', 'readwrite')

			expect(mockDB.transaction).toHaveBeenCalledWith(
				'users',
				'readwrite',
				undefined
			)
			expect(tx).toBe(mockTx)
		})

		it('creates readonly transaction by default', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const mockTx = { store: {}, done: Promise.resolve() }
			mockDB.transaction = vi.fn().mockReturnValue(mockTx)

			await db.transaction('posts')

			expect(mockDB.transaction).toHaveBeenCalledWith(
				'posts',
				undefined,
				undefined
			)
		})

		it('passes transaction options', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const mockTx = { store: {}, done: Promise.resolve() }
			mockDB.transaction = vi.fn().mockReturnValue(mockTx)

			const options = { durability: 'relaxed' as const }
			await db.transaction('users', 'readwrite', options)

			expect(mockDB.transaction).toHaveBeenCalledWith(
				'users',
				'readwrite',
				options
			)
		})
	})

	describe('transactions()', () => {
		it('creates transaction for multiple stores', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const mockTx = { store: {}, done: Promise.resolve() }
			mockDB.transaction = vi.fn().mockReturnValue(mockTx)

			const tx = await db.transactions(['users', 'posts'], 'readwrite')

			expect(mockDB.transaction).toHaveBeenCalledWith(
				['users', 'posts'],
				'readwrite',
				undefined
			)
			expect(tx).toBe(mockTx)
		})

		it('creates readonly transaction by default', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const mockTx = { store: {}, done: Promise.resolve() }
			mockDB.transaction = vi.fn().mockReturnValue(mockTx)

			await db.transactions(['users', 'posts'])

			expect(mockDB.transaction).toHaveBeenCalledWith(
				['users', 'posts'],
				undefined,
				undefined
			)
		})
	})

	describe('trigger()', () => {
		it('dispatches custom event with trigger data', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			db.trigger('set', 'users', 'user-1', 'value')

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'indexdb-trigger:test-db:users:user-1',
				JSON.stringify({
					db: 'test-db',
					version: 1,
					table: 'users',
					key: 'user-1',
					action: 'set',
					value: 'value',
				})
			)
		})
	})

	describe('onChange()', () => {
		it('registers change callback', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const addEventListenerSpy = vi.fn()
			vi.stubGlobal('window', {
				localStorage: mockLocalStorage,
				indexedDB: {},
				addEventListener: addEventListenerSpy,
			})

			const callback = vi.fn()
			db.onChange(callback)

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'storage',
				expect.any(Function)
			)
		})
	})

	describe('onChangeByKey()', () => {
		it('registers key-specific change callback', async () => {
			const db = IndexDB.create<TestSchema, 'v1:test-db'>('v1:test-db', {})

			const addEventListenerSpy = vi.fn()
			vi.stubGlobal('window', {
				localStorage: mockLocalStorage,
				indexedDB: {},
				addEventListener: addEventListenerSpy,
			})

			const callback = vi.fn()
			db.onChangeByKey('users', 'user-1', callback)

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'storage',
				expect.any(Function)
			)
		})
	})
})
