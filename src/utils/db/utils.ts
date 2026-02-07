import type {
	AnyChangedData,
	AnySchemaTable,
	DatabaseRaw,
	DBFullName,
	DBName,
	DBVersion,
	GetSchemaTableKey,
	GetSchemaTableName,
	GetSchemaValue,
} from './models'
import type { Log } from '$lib/loggers/models'

export const emptyDB = <D extends DatabaseRaw<DBFullName>>() => {
	return {
		name: 'v0:empty-db' as DBFullName,
		available: () => false,
	} as D
}

const parseVersion = (v: string) => {
	const version = parseInt(v.slice(1), 10)
	if (isNaN(version) || version < 1) return 1
	else return version
}

export const parseDBFullName = <N extends DBFullName>(name: N) => {
	const raw = name.split(':', 2)
	const _name = raw[1] as DBName<N>
	const _version = parseVersion(raw[0]) as DBVersion<N>
	return [_name, _version] as const
}

export const parseChangedData = <
	Name extends DBFullName,
	Schema extends AnySchemaTable,
	T extends GetSchemaTableName<Schema> = GetSchemaTableName<Schema>,
	K extends GetSchemaTableKey<Schema, T> = GetSchemaTableKey<Schema, T>,
>(
	log: Log<string, string>,
	value: string | null,
	read: (
		data: AnyChangedData<Name, Schema>
	) => Promise<GetSchemaValue<Schema, T, K>>
): AnyChangedData<Name, Schema> | undefined | undefined => {
	if (value === null) {
		log.debug('received null as changed data')
		return undefined
	}
	try {
		const data = JSON.parse(value) as AnyChangedData<Name, Schema>
		return Object.assign(data, {
			read: () => read(data),
		})
	} catch (error) {
		log.error('Failed to parse changed data:', error)
		return undefined
	}
}
