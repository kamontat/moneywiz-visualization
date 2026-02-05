import type { DBFullName, DBIndexKeys } from './name'
import type { AnyKeyVal, ToKey, ToKVs, ToObj } from '$utils/types'

export interface SchemaState<
	Value,
	Indexes extends DBIndexKeys | undefined = undefined,
> {
	value: Value
	indexes: Indexes
}

/** For create schema state */
export type ISchemaState<
	Key extends string | number,
	Value,
	Indexes extends DBIndexKeys | undefined = undefined,
> = { key: Key; value: SchemaState<Value, Indexes> }

/** For create schema table */
export type ISchemaTable<
	TableName extends string,
	States extends AnyKeyVal[],
> = {
	key: TableName
	value: ToObj<ToKVs<States>>
}
type AnyStoreTableSchema = ISchemaTable<string, AnyKeyVal[]>

/** For create schema database */
export type ISchemaDB<R extends Record<DBFullName, AnyStoreTableSchema[]>> = {
	[N in ToKey<R>]: ToObj<ToKVs<R[N]>>
}

/** Use `ISchemaState` when need to construct AnySchemaState */
export type AnySchemaState = Record<
	string,
	SchemaState<unknown, DBIndexKeys | undefined>
>

/** Use `ISchemaTable` when need to construct AnySchemaTable */
export type AnySchemaTable = Record<string, AnySchemaState>

/**
 * Syntax: Map<db-name, Map<table-name, Map<table-key, state>>>
 * State: { value: V; indexes: I }
 */
export type AnySchemaDB = ISchemaDB<Record<DBFullName, AnyStoreTableSchema[]>>
