import type { OnChangeByKeyFn, OnChangeFn, TriggerFn } from './events'
import type {
	GetSchemaTableKey,
	GetSchemaTableName,
	GetSchemaValue,
} from './helper'
import type { DBFullName, DBName, DBVersion } from './name'
import type { AnySchemaDB, AnySchemaTable } from './schema'
import type { ToKey, WithPromiseLike } from '$utils/types'

export interface DatabaseRaw<Name extends DBFullName> {
	readonly name: DBName<Name>
	readonly version: DBVersion<Name>

	available(): boolean
}

export interface DatabaseOnChangeEvent<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
> {
	readonly triggerName: string

	trigger: TriggerFn<Schema>
	onChange: OnChangeFn<Name, Schema>
	onChangeByKey: OnChangeByKeyFn<Name, Schema>
}

export interface DatabaseCRUD<
	Schema extends AnySchemaTable,
	PromiseLike extends boolean,
> {
	/** Get item from database */
	get<
		T extends GetSchemaTableName<Schema>,
		K extends GetSchemaTableKey<Schema, T>,
	>(
		table: T,
		key: K
	): WithPromiseLike<PromiseLike, GetSchemaValue<Schema, T, K> | undefined>

	/** Set item in database */
	set<
		T extends GetSchemaTableName<Schema>,
		K extends GetSchemaTableKey<Schema, T>,
	>(
		table: T,
		key: K,
		value: GetSchemaValue<Schema, T, K>
	): WithPromiseLike<PromiseLike, void>

	/** Delete item from database */
	delete<
		T extends GetSchemaTableName<Schema>,
		K extends GetSchemaTableKey<Schema, T>,
	>(
		table: T,
		key?: K
	): WithPromiseLike<PromiseLike, void>
}

export interface Database<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
>
	extends DatabaseRaw<Name>, DatabaseOnChangeEvent<Name, Schema> {}

export type AnyDatabase<Schema extends AnySchemaDB> = Database<
	ToKey<Schema>,
	Schema[ToKey<Schema>]
>
