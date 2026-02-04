import type { Database } from './db'
import type { DBFullName } from './name'
import type { AnySchemaTable } from './schema'
import type { ToKey } from '$utils/types'

/** Get table name from schema */
export type GetSchemaTableName<Schema extends AnySchemaTable> = ToKey<Schema>
/** Get table key from schema and table name */
export type GetSchemaTableKey<
	Schema extends AnySchemaTable,
	T extends GetSchemaTableName<Schema>,
> = ToKey<Schema, T>

type ExtractSchemaValue<S> = {
	[key in keyof S]: S[key] extends { value: infer V } ? V : S[key]
}
/** Get schema value from input schema */
export type GetSchemaValue<
	S extends AnySchemaTable,
	T extends GetSchemaTableName<S> = GetSchemaTableName<S>,
	K extends GetSchemaTableKey<S, T> | undefined = undefined,
> =
	K extends GetSchemaTableKey<S, T>
		? S[T][K]['value']
		: ExtractSchemaValue<S[T]>

export type GetAnySchemaValue<Schema extends AnySchemaTable> = GetSchemaValue<
	Schema,
	GetSchemaTableName<Schema>,
	GetSchemaTableKey<Schema, GetSchemaTableName<Schema>>
>

export type GetDBFullNameFromDatabase<D> =
	D extends Database<infer N, AnySchemaTable> ? N : never
export type GetTableNameFromDatabase<D> =
	D extends Database<DBFullName, infer S> ? GetSchemaTableName<S> : never
