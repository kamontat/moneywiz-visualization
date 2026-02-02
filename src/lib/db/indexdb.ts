import type { DB, DBChangeCallback, ToIDBSchema, TriggerData } from './models'
import type { Log } from '$lib/loggers/models'
import type {
	DBName,
	DBVersion,
	StoreSchema,
	StoreSchemaVersion,
	StoreTableKey,
	StoreTableName,
} from '$lib/stores/internal'
import type { ToKey } from '$lib/types'
import {
	openDB,
	type DBSchema as iDBSchema,
	type IDBPDatabase,
	type OpenDBCallbacks,
} from 'idb'

import { emptyDB, parseDBFullName } from './utils'

import { browser } from '$app/environment'
import { storage as logger } from '$lib/loggers'

export class IndexDB<
	Name extends StoreSchemaVersion,
	Schema extends StoreSchema[Name],
	DBSchema extends iDBSchema,
> implements DB<Name, Schema> {
	static create<
		DBSchema extends iDBSchema,
		Name extends StoreSchemaVersion = StoreSchemaVersion,
		Schema extends StoreSchema[Name] = StoreSchema[Name],
	>(name: Name, callback: OpenDBCallbacks<DBSchema>) {
		if (!browser) return emptyDB<IndexDB<Name, Schema, DBSchema>>()

		const [_name, _version] = parseDBFullName(name)
		const engine = openDB<DBSchema>(_name, _version, callback)
		return new IndexDB<Name, Schema, DBSchema>(_name, _version, engine)
	}

	public readonly name: DBName<Name>
	public readonly version: DBVersion<Name>
	public readonly triggerName: string
	private readonly engine: Promise<IDBPDatabase<DBSchema>>
	private readonly log: Log<string, string>

	private constructor(
		name: DBName<Name>,
		version: DBVersion<Name>,
		engine: Promise<IDBPDatabase<DBSchema>>
	) {
		this.name = name
		this.version = version
		this.engine = engine
		this.triggerName = `indexdb-trigger:v${version}:${name}`

		this.log = logger.extends('indexdb')
	}

	available(): boolean {
		return (
			browser &&
			typeof window !== 'undefined' &&
			typeof window.localStorage !== 'undefined' &&
			typeof window.indexedDB !== 'undefined'
		)
	}

	onChange(cb: DBChangeCallback<Name, Schema>): void {
		window.addEventListener('storage', (event) => {
			if (event.key?.startsWith(this.triggerName)) {
				cb(event, JSON.parse(event.newValue ?? 'null') ?? undefined)
			}
		})
	}

	trigger<T extends StoreTableName<Schema>, K extends StoreTableKey<Schema, T>>(
		table: T,
		key: K,
		value: Schema[T][K]['value'] | undefined
	) {
		window.localStorage.setItem(
			`${this.triggerName}:${table}:${key}`,
			JSON.stringify({
				db: this.name,
				version: this.version,
				table,
				key,
				value,
			} satisfies TriggerData<Schema, T>)
		)
	}

	async get<
		T extends StoreTableName<Schema>,
		K extends StoreTableKey<Schema, T>,
	>(table: T, key: K): Promise<Schema[T][K]['value'] | undefined> {
		const db = await this.engine
		return db.get(table, key)
	}

	async set<
		T extends StoreTableName<Schema>,
		K extends StoreTableKey<Schema, T>,
	>(table: T, key: K, value: Schema[T][K]['value']): Promise<void> {
		const db = await this.engine
		await db.put(table, value, key)
		this.trigger(table, key, value)
	}

	async remove<
		T extends StoreTableName<Schema>,
		K extends StoreTableKey<Schema, T>,
	>(table: T, key?: K): Promise<void> {
		const db = await this.engine
		if (typeof key === 'undefined') {
			const keys = (await db.getAllKeys(table)).map((k) => k.toString())
			await db.clear(table)
			keys.forEach((key) =>
				this.trigger(table, key as ToKey<Schema[T]>, undefined)
			)
		} else {
			await db.delete(table, key)
			this.trigger(table, key, undefined)
		}
	}

	async transaction<
		T extends StoreTableName<Schema>,
		Mode extends IDBTransactionMode,
	>(table: T, mode?: Mode, options?: IDBTransactionOptions) {
		const db = await this.engine
		return db.transaction(table, mode, options)
	}
	async transactions<
		TS extends ArrayLike<StoreTableName<Schema>>,
		Mode extends IDBTransactionMode,
	>(tables: TS, mode?: Mode, options?: IDBTransactionOptions) {
		const db = await this.engine
		return db.transaction(tables, mode, options)
	}
}
