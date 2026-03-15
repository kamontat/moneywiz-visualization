import type { IDBPDatabase, IDBPTransaction } from 'idb'
import type { Versionable } from '$lib/types'
import { openDB } from 'idb'

export type TransactionCallback<R> = (
	trx: IDBPTransaction<unknown, string[], IDBTransactionMode>
) => Promise<R>

export interface IndexdbTable<T extends string> {
	readonly table: T

	has(key: string): Promise<boolean>
	get<R>(key: string): Promise<R | undefined>
	set<R>(key: string, value: R): Promise<void>
	delete(key: string): Promise<void>
	clear(): Promise<void>
	keys(): Promise<string[]>

	transaction<R>(
		mode: IDBTransactionMode,
		cb: TransactionCallback<R>
	): Promise<R>
}

class IndexdbTableImpl<T extends string> implements IndexdbTable<T> {
	constructor(
		readonly table: T,
		private readonly engine: Promise<IDBPDatabase>
	) {}

	async has(key: string): Promise<boolean> {
		const db = await this.engine
		const value = await db.get(this.table, key)
		return value !== undefined
	}

	async get<R>(key: string): Promise<R | undefined> {
		const db = await this.engine
		return (await db.get(this.table, key)) as R | undefined
	}

	async set<R>(key: string, value: R): Promise<void> {
		const db = await this.engine
		await db.put(this.table, value, key)
	}

	async delete(key: string): Promise<void> {
		const db = await this.engine
		await db.delete(this.table, key)
	}

	async clear(): Promise<void> {
		const db = await this.engine
		await db.clear(this.table)
	}

	async keys(): Promise<string[]> {
		const db = await this.engine
		const keys = await db.getAllKeys(this.table)
		return keys.map(String)
	}

	async transaction<R>(
		mode: IDBTransactionMode,
		cb: TransactionCallback<R>
	): Promise<R> {
		const db = await this.engine
		const tx = db.transaction(this.table, mode)
		const result = await cb(
			tx as unknown as IDBPTransaction<unknown, string[], IDBTransactionMode>
		)
		await tx.done
		return result
	}
}

const DB_NAME = 'moneywiz-v3'
const DB_VERSION = 1
const STORES = ['manifest', 'meta', 'transactions'] as const

export class IndexdbProvider implements Versionable<'indexdb', 1> {
	readonly name = 'indexdb' as const
	readonly version = 1 as const

	private readonly tables = new Map<string, IndexdbTable<string>>()

	constructor(private readonly engine: Promise<IDBPDatabase>) {}

	table<T extends string>(name: T): IndexdbTable<T> {
		if (!this.tables.has(name)) {
			this.tables.set(name, new IndexdbTableImpl(name, this.engine))
		}
		return this.tables.get(name)! as IndexdbTable<T>
	}

	async transaction<R>(
		tables: string[],
		mode: IDBTransactionMode,
		cb: TransactionCallback<R>
	): Promise<R> {
		const db = await this.engine
		const tx = db.transaction(tables, mode)
		const result = await cb(
			tx as unknown as IDBPTransaction<unknown, string[], IDBTransactionMode>
		)
		await tx.done
		return result
	}
}

function setupIndexdbProvider(): IndexdbProvider {
	const engine = openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			for (const store of STORES) {
				if (!db.objectStoreNames.contains(store)) {
					db.createObjectStore(store)
				}
			}
		},
	})
	return new IndexdbProvider(engine)
}

export const indexdb = /* @__PURE__ */ setupIndexdbProvider()
