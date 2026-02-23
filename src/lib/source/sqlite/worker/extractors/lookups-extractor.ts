import type { Database } from '@sqlite.org/sqlite-wasm'
import type {
	SQLiteLookups,
	SQLiteAccount,
	SQLiteCategory,
	SQLiteEntityCount,
	SQLitePayee,
	SQLiteTag,
	SQLiteUser,
} from '$lib/source/sqlite/models'
import {
	SQLITE_ACCOUNT_ENTITY_RANGE,
	SQLITE_CORE_ENTITY_IDS,
} from '$lib/source/sqlite/models'
import { readRows } from '$lib/source/sqlite/worker/runtime'
import {
	getNumberValue,
	getTextValue,
	NAME_COLUMNS,
	toBoolean,
	toEntityName,
	toInteger,
} from '$lib/source/sqlite/worker/utils'

export const extractLookups = (db: Database): SQLiteLookups => {
	const entityRows = readRows(
		db,
		'SELECT Z_ENT, Z_NAME FROM Z_PRIMARYKEY ORDER BY Z_ENT'
	)
	const entityNameById = new Map<number, string>()
	for (const row of entityRows) {
		const entityId = toInteger(getNumberValue(row, ['Z_ENT']))
		const entityName = getTextValue(row, ['Z_NAME'])
		if (entityId === undefined || !entityName) continue
		entityNameById.set(entityId, entityName)
	}

	const entities: SQLiteEntityCount[] = readRows(
		db,
		'SELECT Z_ENT, COUNT(*) AS row_count FROM ZSYNCOBJECT GROUP BY Z_ENT'
	)
		.map((row) => {
			const entityId = toInteger(getNumberValue(row, ['Z_ENT'])) ?? -1
			return {
				entityId,
				entityName: toEntityName(entityNameById, entityId),
				rowCount: toInteger(getNumberValue(row, ['row_count'])) ?? 0,
			} as SQLiteEntityCount
		})
		.filter((row) => row.entityId >= 0)
		.toSorted((left, right) => right.rowCount - left.rowCount)

	const accounts: SQLiteAccount[] = readRows(
		db,
		`SELECT Z_PK, Z_ENT, ZNAME, ZNAME1, ZNAME2, ZNAME3, ZNAME4, ZNAME5, ZNAME6,
			ZCURRENCYNAME, ZCURRENCYNAME1, ZCURRENCYNAME2, ZCURRENCYNAME3, ZARCHIVED
		FROM ZSYNCOBJECT
		WHERE Z_ENT BETWEEN ${SQLITE_ACCOUNT_ENTITY_RANGE.min}
			AND ${SQLITE_ACCOUNT_ENTITY_RANGE.max}
		ORDER BY Z_PK`
	)
		.map((row) => {
			const id = toInteger(getNumberValue(row, ['Z_PK']))
			const entityId = toInteger(getNumberValue(row, ['Z_ENT']))
			if (id === undefined || entityId === undefined) return undefined
			return {
				id,
				entityId,
				entityName: toEntityName(entityNameById, entityId),
				name: getTextValue(row, NAME_COLUMNS) ?? `Account #${id}`,
				currency: getTextValue(row, [
					'ZCURRENCYNAME',
					'ZCURRENCYNAME1',
					'ZCURRENCYNAME2',
					'ZCURRENCYNAME3',
				]),
				isArchived: toBoolean(getNumberValue(row, ['ZARCHIVED'])) ?? false,
			} as SQLiteAccount
		})
		.filter((row): row is SQLiteAccount => row !== undefined)

	const payees: SQLitePayee[] = readRows(
		db,
		`SELECT Z_PK, ZNAME, ZNAME1, ZNAME2, ZNAME3, ZNAME4, ZNAME5, ZNAME6
		FROM ZSYNCOBJECT
		WHERE Z_ENT = ${SQLITE_CORE_ENTITY_IDS.payee}
		ORDER BY Z_PK`
	)
		.map((row) => {
			const id = toInteger(getNumberValue(row, ['Z_PK']))
			if (id === undefined) return undefined
			return {
				id,
				name: getTextValue(row, NAME_COLUMNS) ?? `Payee #${id}`,
			} as SQLitePayee
		})
		.filter((row): row is SQLitePayee => row !== undefined)

	const categories: SQLiteCategory[] = readRows(
		db,
		`SELECT Z_PK, ZPARENTCATEGORY, ZNAME, ZNAME1, ZNAME2, ZNAME3, ZNAME4, ZNAME5, ZNAME6
		FROM ZSYNCOBJECT
		WHERE Z_ENT = ${SQLITE_CORE_ENTITY_IDS.category}
		ORDER BY Z_PK`
	)
		.map((row) => {
			const id = toInteger(getNumberValue(row, ['Z_PK']))
			if (id === undefined) return undefined
			return {
				id,
				name: getTextValue(row, NAME_COLUMNS) ?? `Category #${id}`,
				parentId: toInteger(getNumberValue(row, ['ZPARENTCATEGORY'])),
			} as SQLiteCategory
		})
		.filter((row): row is SQLiteCategory => row !== undefined)
	const categoriesById = new Map(categories.map((row) => [row.id, row]))
	for (const category of categories) {
		if (category.parentId === undefined) continue
		category.parentName = categoriesById.get(category.parentId)?.name
	}

	const tags: SQLiteTag[] = readRows(
		db,
		`SELECT Z_PK, ZNAME, ZNAME1, ZNAME2, ZNAME3, ZNAME4, ZNAME5, ZNAME6
		FROM ZSYNCOBJECT
		WHERE Z_ENT = ${SQLITE_CORE_ENTITY_IDS.tag}
		ORDER BY Z_PK`
	)
		.map((row) => {
			const id = toInteger(getNumberValue(row, ['Z_PK']))
			if (id === undefined) return undefined
			return {
				id,
				name: getTextValue(row, NAME_COLUMNS) ?? `Tag #${id}`,
			} as SQLiteTag
		})
		.filter((row): row is SQLiteTag => row !== undefined)

	const userRows = readRows(
		db,
		'SELECT Z_PK, Z_ENT, ZSYNCUSERID, ZAPPSETTINGS, ZSYNCLOGIN FROM ZUSER ORDER BY Z_PK'
	)
	const activeUserId = toInteger(
		getNumberValue(
			readRows(db, 'SELECT ZCURRENTUSER FROM ZCOMMONSETTINGS LIMIT 1')[0] ?? {},
			['ZCURRENTUSER']
		)
	)
	const users: SQLiteUser[] = userRows
		.map((row) => {
			const id = toInteger(getNumberValue(row, ['Z_PK']))
			if (id === undefined) return undefined
			return {
				id,
				email: getTextValue(row, ['ZSYNCLOGIN']),
				entityId: toInteger(getNumberValue(row, ['Z_ENT'])),
				syncUserId: toInteger(getNumberValue(row, ['ZSYNCUSERID'])),
				appSettingsId: toInteger(getNumberValue(row, ['ZAPPSETTINGS'])),
				isActive: id === activeUserId,
			} as SQLiteUser
		})
		.filter((row): row is SQLiteUser => row !== undefined)

	return {
		entityNameById,
		entities,
		accounts,
		payees,
		categories,
		tags,
		users,
		activeUser: users.find((user) => user.isActive),
	}
}
