import type { DB, DBChangeCallback, TriggerData } from './models'
import type { Log } from '$lib/loggers/models'
import type {
	DBName,
	DBVersion,
	StoreSchema,
	StoreSchemaVersion,
	StoreTableKey,
	StoreTableName,
} from '$lib/stores'
import { emptyDB, parseDBFullName } from './utils'

import { browser } from '$app/environment'
import { storage as logger } from '$lib/loggers'

export class LocalDB<
	Name extends StoreSchemaVersion,
	Schema extends StoreSchema[Name],
> implements DB<Name, Schema> {
	static create<
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
		this.name = _name
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

	private getKey(table?: string, key?: string) {
		let output = this.baseKey()
		if (table !== undefined) output = `${output}${LocalDB.separator}${table}`
		if (key !== undefined) output = `${output}${LocalDB.separator}${key}`
		return output
	}

	private baseKey() {
		return `v${this.version}:${this.name}`
	}
}
