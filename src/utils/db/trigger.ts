import type {
	AnySchemaTable,
	ChangedTriggerData,
	ChangedTriggerDataAction,
	DBFullName,
	DBName,
	DBVersion,
	GetAnySchemaValue,
	GetSchemaTableKey,
	GetSchemaTableName,
	OnChangeCallback,
} from './models'
import type { Log } from '$lib/loggers/models'
import { parseChangedData } from './utils'

export interface TriggerContext<
	Name extends DBFullName,
	Schema extends AnySchemaTable,
> {
	name: DBName<Name>
	version: DBVersion<Name>
	triggerName: string
	log: Log<string, string>
	readValue: (
		table: GetSchemaTableName<Schema>,
		key: GetSchemaTableKey<Schema, GetSchemaTableName<Schema>>
	) => Promise<GetAnySchemaValue<Schema>>
}

export const fireTrigger = <
	Name extends DBFullName,
	Schema extends AnySchemaTable,
	T extends GetSchemaTableName<Schema>,
	K extends GetSchemaTableKey<Schema, T>,
>(
	ctx: TriggerContext<Name, Schema>,
	action: ChangedTriggerDataAction,
	table: T,
	key: K,
	value: string
): void => {
	const trigger = `${ctx.triggerName}:${table}:${key}`
	const data: ChangedTriggerData<Name, Schema, T, K> = {
		db: ctx.name,
		version: ctx.version,
		table,
		key,
		action,
		value,
	}

	localStorage.setItem(trigger, JSON.stringify(data))
}

export const listenForChanges = <
	Name extends DBFullName,
	Schema extends AnySchemaTable,
>(
	ctx: TriggerContext<Name, Schema>,
	callback: OnChangeCallback<Name, Schema>
): void => {
	window.addEventListener('storage', (event) => {
		if (event.key?.startsWith(ctx.triggerName)) {
			const data = parseChangedData<Name, Schema>(
				ctx.log,
				event.newValue,
				(d) =>
					ctx.readValue(
						d.table as GetSchemaTableName<Schema>,
						d.key as GetSchemaTableKey<Schema, GetSchemaTableName<Schema>>
					)
			)

			callback(event, data)
		}
	})
}

export const listenForChangesByKey = <
	Name extends DBFullName,
	Schema extends AnySchemaTable,
	T extends GetSchemaTableName<Schema>,
	K extends GetSchemaTableKey<Schema, T>,
>(
	ctx: TriggerContext<Name, Schema>,
	table: T,
	key: K,
	callback: OnChangeCallback<Name, Schema, T, K>
): void => {
	listenForChanges(ctx, (event, data) => {
		if (data?.table === table && data?.key === key) {
			callback(event, data)
		}
	})
}
