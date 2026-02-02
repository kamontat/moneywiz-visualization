import type {
	AnyStoreSchema,
	DBFullName,
	DBName,
	DBVersion,
	StoreSchema,
	StoreSchemaVersion,
	StoreTableKey,
	StoreTableName,
} from '$lib/stores'
import type { AnyRecord, ToKey, ToObj } from '$lib/types'

export interface TriggerData<
	Schema extends AnyStoreSchema[DBFullName],
	T extends StoreTableName<Schema>,
> {
	db: string
	version: number
	table: T
	key: StoreTableKey<Schema, T>
	value: Schema[T][StoreTableKey<Schema, T>]['value'] | undefined
}

export interface AnyTriggerData<S> {
	db: string
	version: number
	table: string
	key: string
	value: S
}

export type DBChangeCallback<
	Name extends DBFullName,
	Schema extends AnyStoreSchema[Name],
> = <T extends StoreTableName<Schema>, K extends StoreTableKey<Schema, T>>(
	event: StorageEvent,
	data: AnyTriggerData<Schema[T][K]['value']> | undefined
) => void

export interface DB<
	Name extends DBFullName,
	Schema extends AnyStoreSchema[Name] = AnyStoreSchema[Name],
> {
	readonly name: DBName<Name>
	readonly version: DBVersion<Name>
	readonly triggerName: string

	available(): boolean

	trigger(table: string, key: string, value: AnyRecord | undefined): void
	onChange(cb: DBChangeCallback<Name, Schema>): void
}

type IDBSchemaValue<S extends AnyRecord> = {
	key: ToKey<S>
	value: S[ToKey<S>]['value']
	indexes: NonNullable<S[ToKey<S>]['indexes']>
}

export type ToIDBSchema<Schema extends StoreSchema[StoreSchemaVersion]> = {
	[T in ToKey<Schema>]: ToObj<IDBSchemaValue<Schema[T]>>
}
