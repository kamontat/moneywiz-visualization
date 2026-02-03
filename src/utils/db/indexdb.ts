import type { ToKey } from '$utils/types'
import {
	openDB,
	type IDBPDatabase,
	type OpenDBCallbacks,
	type StoreValue,
} from 'idb'

import {
	type AnySchemaDB,
	type AnySchemaTable,
	type ChangedTriggerData,
	type ChangedTriggerDataAction,
	type Database,
	type DatabaseCRUD,
	type DBFullName,
	type DBName,
	type DBVersion,
	type GetSchemaTableKey,
	type GetSchemaTableName,
	type GetSchemaValue,
	type OnChangeCallback,
	type ToIDBSchema,
} from './models'
import { emptyDB, parseDBFullName } from './utils'

import { browser } from '$app/environment'

export class IndexDB<Name extends DBFullName, Schema extends AnySchemaTable>
	implements Database<Name, Schema>, DatabaseCRUD<Schema, true>
{
	static create<
		Schema extends AnySchemaDB,
		Name extends ToKey<Schema> = ToKey<Schema>,
	>(name: Name, callbacks: OpenDBCallbacks<ToIDBSchema<Schema[Name]>>) {
		if (!browser) return emptyDB<IndexDB<Name, Schema[Name]>>()
		const [_name, _version] = parseDBFullName(name)
		const engine = openDB(_name, _version, callbacks)
		return new IndexDB<Name, Schema[Name]>(_name, _version, engine)
	}

	public readonly name: DBName<Name>
	public readonly version: DBVersion<Name>
	public readonly triggerName: string
	private readonly engine: Promise<IDBPDatabase<ToIDBSchema<Schema>>>
	private constructor(
		name: DBName<Name>,
		version: DBVersion<Name>,
		engine: Promise<IDBPDatabase<ToIDBSchema<Schema>>>
	) {
		this.name = name
		this.version = version
		this.engine = engine

		this.triggerName = `indexdb-trigger:${name}`
	}

	available(): boolean {
		return (
			browser &&
			typeof window !== 'undefined' &&
			typeof window.localStorage !== 'undefined' &&
			typeof window.indexedDB !== 'undefined'
		)
	}

	trigger<
		T extends GetSchemaTableName<Schema>,
		K extends GetSchemaTableKey<Schema, T>,
	>(action: ChangedTriggerDataAction, table: T, key: K) {
		const trigger = `${this.triggerName}:${table}:${key}`
		const data: ChangedTriggerData<Name, Schema, T, K> = {
			db: this.name,
			version: this.version,
			table,
			key,
			action,
		}

		localStorage.setItem(trigger, JSON.stringify(data))
	}

	onChange(callback: OnChangeCallback<Name, Schema>) {
		window.addEventListener('storage', (event) => {
			if (event.key?.startsWith(this.triggerName)) {
				callback(event, JSON.parse(event.newValue ?? 'null') ?? undefined)
			}
		})
	}

	onChangeByKey<
		T extends GetSchemaTableName<Schema>,
		K extends GetSchemaTableKey<Schema, T>,
	>(table: T, key: K, callback: OnChangeCallback<Name, Schema, T, K>) {
		this.onChange((event, data) => {
			if (data?.table === table && data?.key === key) {
				callback(event, data)
			}
		})
	}

	async get<T extends ToKey<Schema>, K extends ToKey<Schema, T>>(
		table: T,
		key: K
	): Promise<GetSchemaValue<Schema, T, K> | undefined> {
		const db = await this.engine
		return db.get(table, key) as GetSchemaValue<Schema, T, K> | undefined
	}

	async set<T extends ToKey<Schema, undefined>, K extends ToKey<Schema, T>>(
		table: T,
		key: K,
		value: GetSchemaValue<Schema, T, K>
	): Promise<void> {
		const db = await this.engine
		await db.put(table, value as StoreValue<ToIDBSchema<Schema>, K>, key)
		this.trigger('set', table, key)
	}

	async delete<T extends ToKey<Schema, undefined>, K extends ToKey<Schema, T>>(
		table: T,
		key?: K
	): Promise<void> {
		const db = await this.engine
		if (typeof key === 'undefined') {
			const keys = (await db.getAllKeys(table)).map((k) => k.toString())
			await db.clear(table)
			keys.forEach((key) =>
				this.trigger('delete', table, key as ToKey<Schema[T]>)
			)
		} else {
			await db.delete(table, key)
			this.trigger('delete', table, key)
		}
	}

	/** Create transaction for single store */
	async transaction<
		T extends GetSchemaTableName<Schema>,
		Mode extends IDBTransactionMode,
	>(table: T, mode?: Mode, options?: IDBTransactionOptions) {
		const db = await this.engine
		return db.transaction(table, mode, options)
	}

	/** Create transaction for multiple stores */
	async transactions<
		TS extends ArrayLike<GetSchemaTableName<Schema>>,
		Mode extends IDBTransactionMode,
	>(tables: TS, mode?: Mode, options?: IDBTransactionOptions) {
		const db = await this.engine
		return db.transaction(tables, mode, options)
	}

	/** For testing only */
	// getEngine() {
	// 	return this.engine
	// }
}
