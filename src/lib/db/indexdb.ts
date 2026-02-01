import type { DB, DBChangeCallback, ToIDBSchema, TriggerData } from './models'
import type {
	DBName,
	DBVersion,
	StoreSchema,
	StoreSchemaVersion,
	StoreTableKey,
	StoreTableName,
} from '$lib/stores/internal'
import {
	openDB,
	type DBSchema as iDBSchema,
	type IDBPDatabase,
	type OpenDBCallbacks,
} from 'idb'

import { emptyDB } from './utils'

import { browser } from '$app/environment'

type IndexDBModel<
	Name extends StoreSchemaVersion,
	Schema extends StoreSchema[Name],
	DBSchema extends iDBSchema,
> = DB<Name, Schema> & IDBPDatabase<DBSchema>

const buildIndexDB = <
	Name extends StoreSchemaVersion,
	Schema extends StoreSchema[Name],
>(
	name: DBName<Name>,
	version: DBVersion<Name>
): Omit<DB<Name, Schema>, 'name' | 'version'> => {
	const triggerName = `indexdb-trigger:v${version}:${name}`

	const available: DB<Name, Schema>['available'] = () => {
		return (
			browser &&
			typeof window !== 'undefined' &&
			typeof window.indexedDB !== 'undefined'
		)
	}

	const trigger = <
		T extends StoreTableName<Schema>,
		K extends StoreTableKey<Schema, T>,
	>(
		table: T,
		key: K,
		value: Schema[T][K]['value'] | undefined
	) => {
		localStorage.setItem(
			`${triggerName}:${table}:${key}`,
			JSON.stringify({
				db: name,
				version,
				table,
				key,
				value,
			} satisfies TriggerData<Schema, StoreTableName<Schema>>)
		)
	}

	const onChange: DB<Name, Schema>['onChange'] = (
		cb: DBChangeCallback<Name, Schema>
	) => {
		window.addEventListener('storage', (event) => {
			if (event.key?.startsWith(triggerName)) {
				cb(event, JSON.parse(event.newValue ?? 'null') ?? undefined)
			}
		})
	}

	return {
		available,
		triggerName,
		trigger,
		onChange,
	}
}

const parseVersion = (v: string) => {
	const version = parseInt(v.slice(1), 10)
	if (isNaN(version) || version < 1) return 1
	else return version
}

export class IndexDB {
	// TODO: Make this synchronous like LocalDB
	static async create<
		Name extends StoreSchemaVersion,
		Schema extends StoreSchema[Name],
		DBSchema extends iDBSchema,
	>(name: Name, callback: OpenDBCallbacks<DBSchema>) {
		if (!browser) return emptyDB<IndexDBModel<Name, Schema, DBSchema>>()

		const raw = name.split(':', 2)

		const _name = raw[1] as DBName<Name>
		const _version = parseVersion(raw[0]) as DBVersion<Name>
		const engine = await openDB<DBSchema>(_name, _version, callback)
		const db = buildIndexDB(_name, _version)

		return Object.assign(engine, db) as IndexDBModel<Name, Schema, DBSchema>
	}

	private constructor() {}
}
