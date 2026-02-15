import type {
	SQLiteAccount,
	SQLiteAccountRef,
	SQLitePayee,
	SQLitePayeeRef,
} from './models'

export type SqlRow = Record<string, unknown>

export const APPLE_REFERENCE_EPOCH_MS = Date.UTC(2001, 0, 1, 0, 0, 0)

export const NAME_COLUMNS = [
	'ZNAME',
	'ZNAME1',
	'ZNAME2',
	'ZNAME3',
	'ZNAME4',
	'ZNAME5',
	'ZNAME6',
] as const

export const CURRENCY_COLUMNS = [
	'ZORIGINALCURRENCY',
	'ZORIGINALSENDERCURRENCY',
	'ZORIGINALRECIPIENTCURRENCY',
	'ZCURRENCYNAME',
	'ZCURRENCYNAME1',
	'ZCURRENCYNAME2',
	'ZCURRENCYNAME3',
] as const

export const getTextValue = (
	row: SqlRow,
	columns: readonly string[]
): string | undefined => {
	for (const column of columns) {
		const value = row[column]
		if (typeof value !== 'string') continue
		const text = value.trim()
		if (text.length > 0) return text
	}
	return undefined
}

export const getNumberValue = (
	row: SqlRow,
	columns: readonly string[]
): number | undefined => {
	for (const column of columns) {
		const value = row[column]
		if (typeof value === 'number' && Number.isFinite(value)) return value
		if (typeof value === 'bigint') return Number(value)
		if (typeof value === 'string') {
			const parsed = Number(value)
			if (Number.isFinite(parsed)) return parsed
		}
	}
	return undefined
}

export const toInteger = (value: number | undefined): number | undefined =>
	value === undefined ? undefined : Math.trunc(value)

export const toBoolean = (value: number | undefined): boolean | undefined =>
	value === undefined ? undefined : value !== 0

export const toCoreDataISOString = (
	timestamp: number | undefined
): string | undefined => {
	if (timestamp === undefined || !Number.isFinite(timestamp)) return undefined
	return new Date(APPLE_REFERENCE_EPOCH_MS + timestamp * 1000).toISOString()
}

export const pushGrouped = <T>(
	source: Map<number, T[]>,
	key: number,
	value: T
): void => {
	const current = source.get(key)
	if (!current) {
		source.set(key, [value])
		return
	}
	current.push(value)
}

export const toEntityName = (
	entityNames: Map<number, string>,
	entityId: number
): string => entityNames.get(entityId) ?? `Entity ${entityId}`

export const toAccountRef = (
	accountsById: Map<number, SQLiteAccount>,
	id: number | undefined
): SQLiteAccountRef | undefined => {
	if (id === undefined) return undefined
	const account = accountsById.get(id)
	if (!account) {
		return {
			id,
			name: `Unknown Account #${id}`,
		}
	}
	return {
		id: account.id,
		name: account.name,
		entityId: account.entityId,
		entityName: account.entityName,
	}
}

export const toPayeeRef = (
	payeesById: Map<number, SQLitePayee>,
	id: number | undefined
): SQLitePayeeRef | undefined => {
	if (id === undefined) return undefined
	const payee = payeesById.get(id)
	if (!payee) {
		return {
			id,
			name: `Unknown Payee #${id}`,
		}
	}
	return {
		id: payee.id,
		name: payee.name,
	}
}
