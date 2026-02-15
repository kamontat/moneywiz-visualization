import type {
	AnySchemaDB,
	AnySchemaTable,
	ChangedTriggerDataAction,
	Database,
	DatabaseCRUD,
	DBFullName,
	DBName,
	DBVersion,
	GetAnySchemaValue,
	GetSchemaTableKey,
	GetSchemaTableName,
	GetSchemaValue,
	OnChangeCallback,
} from './models'
import type { ToKey, WithPromiseLike } from '$utils/types'
import {
	type TriggerContext,
	fireTrigger,
	listenForChanges,
	listenForChangesByKey,
} from './trigger'
import { emptyDB, parseDBFullName } from './utils'

import { browser } from '$app/environment'
import { db } from '$lib/loggers'
import { Log } from '$lib/loggers/models'

export class LocalDB<Name extends DBFullName, Schema extends AnySchemaTable>
	implements Database<Name, Schema>, DatabaseCRUD<Schema, false>
{
	static create<
		Schema extends AnySchemaDB,
		Name extends ToKey<Schema> = ToKey<Schema>,
	>(name: Name) {
		if (!browser) return emptyDB<LocalDB<Name, Schema[Name]>>()
		return new LocalDB<Name, Schema[Name]>(name, localStorage)
	}

	private static readonly separator = ':'

	public readonly type: string
	public readonly name: DBName<Name>
	public readonly version: DBVersion<Name>
	public readonly triggerName: string
	private readonly storage: Storage
	private readonly log: Log<string, string>
	private constructor(name: Name, storage: Storage) {
		const [_name, _version] = parseDBFullName(name)
		this.type = 'localdb'
		this.name = _name
		this.version = _version
		this.storage = storage
		this.log = db.extends(this.type)

		this.triggerName = `${this.type}-trigger:${name}`
	}

	available(): boolean {
		return (
			browser &&
			typeof window !== 'undefined' &&
			typeof window.localStorage !== 'undefined'
		)
	}

	private get triggerCtx(): TriggerContext<Name, Schema> {
		return {
			name: this.name,
			version: this.version,
			triggerName: this.triggerName,
			log: this.log,
			readValue: (table, key) =>
				Promise.resolve(this.get(table, key) as GetAnySchemaValue<Schema>),
		}
	}

	trigger<
		T extends GetSchemaTableName<Schema>,
		K extends GetSchemaTableKey<Schema, T>,
	>(action: ChangedTriggerDataAction, table: T, key: K, value: string) {
		fireTrigger(this.triggerCtx, action, table, key, value)
	}

	onChange(callback: OnChangeCallback<Name, Schema>) {
		listenForChanges(this.triggerCtx, callback)
	}

	onChangeByKey<
		T extends GetSchemaTableName<Schema>,
		K extends GetSchemaTableKey<Schema, T>,
	>(table: T, key: K, callback: OnChangeCallback<Name, Schema, T, K>) {
		listenForChangesByKey(this.triggerCtx, table, key, callback)
	}

	get<T extends ToKey<Schema>, K extends ToKey<Schema, T>>(
		table: T,
		key: K
	): GetSchemaValue<Schema, T, K> | undefined {
		const _key = this.getKey(table, key)
		this.log.debug(`getting item with key: ${_key}`)
		const val = this.storage.getItem(_key)
		if (val === undefined || val === null) return undefined
		else return JSON.parse(val)
	}

	set<T extends ToKey<Schema>, K extends ToKey<Schema, T>>(
		table: T,
		key: K,
		value: GetSchemaValue<Schema, T, K>
	): void {
		const _key = this.getKey(table, key)
		this.log.debug(`setting item with key: ${_key}`)
		this.storage.setItem(_key, JSON.stringify(value))
	}

	delete<T extends GetSchemaTableName<Schema>>(
		table: T
	): WithPromiseLike<false, string[]>
	delete<
		T extends GetSchemaTableName<Schema>,
		K extends GetSchemaTableKey<Schema, T>,
	>(table: T, key: K): WithPromiseLike<false, void>
	delete<T extends ToKey<Schema>, K extends ToKey<Schema, T> | undefined>(
		table: T,
		key?: K
		// ts-ignore
	): string[] | void {
		if (typeof key === 'undefined') {
			// delete all items in table
			const prefix = `${this.getKey(table)}${LocalDB.separator}`
			const keys = []
			for (let i = 0; i < this.storage.length; i++) {
				const key = this.storage.key(i)
				if (key?.startsWith(prefix)) {
					this.storage.removeItem(key)
					keys.push(key)
				}
			}
			return keys
		} else {
			this.storage.removeItem(this.getKey(table, key))
		}
	}

	clear(): void {
		this.storage.clear()
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
