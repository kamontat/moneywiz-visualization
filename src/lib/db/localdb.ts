import type { DB, DBChangeCallback, TriggerData } from './models'
import type { Log } from '$lib/loggers/models'
import type {
	DBName,
	DBVersion,
	StoreSchema,
	StoreSchemaVersion,
	StoreTableKey,
	StoreTableName,
} from '$lib/stores/internal'
import { emptyDB, parseDBFullName } from './utils'

import { browser } from '$app/environment'
import { storage as logger } from '$lib/loggers'

export class LocalDB<
	Name extends StoreSchemaVersion,
	Schema extends StoreSchema[Name],
> implements DB<Name, Schema> {
	static async create<
		Name extends StoreSchemaVersion,
		Schema extends StoreSchema[Name],
	>(name: Name) {
		return browser
			? new LocalDB<Name, Schema>(name, localStorage)
			: emptyDB<LocalDB<Name, Schema>>()
	}

	private static readonly separator = ':'

	public readonly name: DBName<Name>
	public readonly version: DBVersion<Name>
	public readonly triggerName: string
	private readonly storage: Storage
	private readonly log: Log<string, string>
	private constructor(name: Name, storage: Storage) {
		const [_name, _version] = parseDBFullName(name)
		this.name = _name as DBName<Name>
		this.version = _version as DBVersion<Name>
		this.storage = storage
		this.log = logger.extends('localdb')

		this.triggerName = `localdb-trigger:${name}`
	}

	available(): boolean {
		return (
			browser &&
			typeof window !== 'undefined' &&
			typeof window.localStorage !== 'undefined'
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
		this.storage.setItem(
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

	get<T extends StoreTableName<Schema>, K extends StoreTableKey<Schema, T>>(
		table: T,
		key: K
	): Schema[T][K]['value'] | undefined {
		const _key = this.getKey(table, key)
		this.log.debug(`getting item with key: ${_key}`)
		const val = this.storage.getItem(_key)
		if (val === undefined || val === null) return undefined
		else return JSON.parse(val)
	}

	set<T extends StoreTableName<Schema>, K extends StoreTableKey<Schema, T>>(
		table: T,
		key: K,
		value: Schema[T][K]['value']
	) {
		const _key = this.getKey(table, key)
		this.log.debug(`setting item with key: ${_key}`)
		this.storage.setItem(_key, JSON.stringify(value))
		this.trigger(table, key, value)
	}

	remove<T extends StoreTableName<Schema>, K extends StoreTableKey<Schema, T>>(
		table: T,
		key: K
	) {
		this.storage.removeItem(this.getKey(table, key))
		this.trigger(table, key, undefined)
	}

	clear() {
		const keys = []
		for (let i = 0; i < this.storage.length; i++) {
			const key = this.storage.key(i)
			if (key) keys.push(key)
		}

		this.storage.clear()

		for (const key of keys) {
			type Table = StoreTableName<Schema>
			type Key = StoreTableKey<Schema, Table>
			const [_v, _db, _table, _key] = this.splitKey(key)
			if (_table && _key) this.trigger(_table as Table, _key as Key, undefined)
		}
	}

	private getKey(table?: string, key?: string) {
		let output = this.baseKey()
		if (table !== undefined) output = `${output}${LocalDB.separator}${table}`
		if (key !== undefined) output = `${output}${LocalDB.separator}${key}`
		return output
	}

	private splitKey(fullKey: string) {
		if (!fullKey.startsWith(this.baseKey()))
			return [undefined, undefined, undefined, undefined] as const
		const parts = fullKey.split(LocalDB.separator, 4)
		return [parts.at(0), parts.at(1), parts.at(2), parts.at(3)] as const
	}

	private baseKey() {
		return `v${this.version}:${this.name}`
	}

	// private getPrefixKey(table?: string, key?: string) {
	// 	return this.getKey(table, key) + LocalDB.separator
	// }
}
