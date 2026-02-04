import type {
	GetSchemaTableKey,
	GetSchemaTableName,
	GetSchemaValue,
} from './helper'
import type { DBFullName, DBName, DBVersion } from './name'
import type { AnySchemaTable } from './schema'

export type ChangedTriggerDataAction = 'set' | 'delete'

/** Data send from trigger() */
export interface ChangedTriggerData<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
	T extends GetSchemaTableName<Schema>,
	K extends GetSchemaTableKey<Schema, T>,
> {
	db: DBName<Name>
	version: DBVersion<Name>
	table: T
	key: K
	action: ChangedTriggerDataAction
	/** when value is the same, event will not trigger */
	value: string
}

export type ChangedValueReader<V> = () => Promise<V>

/** Data received from onChange() */
export interface ChangedData<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
	T extends GetSchemaTableName<Schema>,
	K extends GetSchemaTableKey<Schema, T>,
> extends ChangedTriggerData<Name, Schema, T, K> {
	read: ChangedValueReader<GetSchemaValue<Schema, T, K>>
}

export type AnyChangedData<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
> = ChangedData<
	Name,
	Schema,
	GetSchemaTableName<Schema>,
	GetSchemaTableKey<Schema, GetSchemaTableName<Schema>>
>

/** Callback from OnChange event */
export type OnChangeCallback<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
	T extends GetSchemaTableName<Schema> = GetSchemaTableName<Schema>,
	K extends GetSchemaTableKey<Schema, T> = GetSchemaTableKey<Schema, T>,
> = (
	event: StorageEvent,
	data: ChangedData<Name, Schema, T, K> | undefined
) => void

/** Function called when data is changed */
export type TriggerFn<Schema extends AnySchemaTable> = <
	T extends GetSchemaTableName<Schema>,
	K extends GetSchemaTableKey<Schema, T>,
>(
	action: ChangedTriggerDataAction,
	table: T,
	key: K,
	value: string
) => void

/** Function to register onChange callback */
export type OnChangeFn<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
> = (callback: OnChangeCallback<Name, Schema>) => void

/** Function to register onChangeByKey callback */
export type OnChangeByKeyFn<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
> = <
	T extends GetSchemaTableName<Schema>,
	K extends GetSchemaTableKey<Schema, T>,
>(
	table: T,
	key: K,
	callback: OnChangeCallback<Name, Schema, T, K>
) => void
