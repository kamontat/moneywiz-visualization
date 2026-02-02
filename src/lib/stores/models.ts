import type { DBSchema } from 'idb'
import type { ToKey, ToKVs, ToObj } from '$lib/types'

export type DBFullName = `v${number}:${string}`
export type DBIndexKeys = NonNullable<DBSchema[string]['indexes']>

export type DBName<F extends DBFullName> =
	F extends `v${number}:${infer N extends string}` ? N : never
export type DBVersion<F extends DBFullName> =
	F extends `v${infer V extends number}:${string}` ? V : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyKeyVal = { key: string; value: any }

type ExtractValue<T> = {
	[key in keyof T]: T[key] extends { value: infer V } ? V : T[key]
}

export type IStoreValue<
	K extends string,
	V,
	I extends DBIndexKeys | undefined = undefined,
> = { key: K; value: { value: V; indexes: I } }

export type IStoreTableSchema<
	Name extends string,
	Value extends AnyKeyVal[],
> = {
	key: Name
	value: ToObj<ToKVs<Value>>
}
type AnyStoreTableSchema = IStoreTableSchema<string, AnyKeyVal[]>

export type IStoreSchema<
	Name extends DBFullName,
	Table extends AnyStoreTableSchema[],
> = {
	[N in Name]: ToObj<ToKVs<Table>>
}
export type AnyStoreSchema = IStoreSchema<DBFullName, AnyStoreTableSchema[]>

export type StoreTableName<Schema> = ToKey<Schema>
export type StoreTableKey<Schema, T extends StoreTableName<Schema>> = ToKey<
	Schema,
	T
>

export type SchemaState<
	S extends AnyStoreSchema,
	DB extends ToKey<S> = ToKey<S>,
	T extends StoreTableName<S[DB]> = StoreTableName<S[DB]>,
	K extends StoreTableKey<S[DB], T> | undefined = undefined,
> =
	K extends StoreTableKey<S[DB], T>
		? S[DB][T][K]['value']
		: ExtractValue<S[DB][T]>
