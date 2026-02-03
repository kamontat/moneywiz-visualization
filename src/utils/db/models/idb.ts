import type { AnySchemaState, AnySchemaTable } from './schema'
import type { ToKey, ToObj } from '$utils/types'

type IDBSchemaValue<S extends AnySchemaState> = {
	key: ToKey<S>
	value: S[ToKey<S>]['value']
	indexes: NonNullable<S[ToKey<S>]['indexes']>
}

export type ToIDBSchema<Schema extends AnySchemaTable> = {
	[T in ToKey<Schema>]: ToObj<IDBSchemaValue<Schema[T]>>
}
