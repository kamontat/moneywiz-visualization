import type { Database } from '@sqlite.org/sqlite-wasm'
import type {
	SQLiteAccount,
	SQLiteCategory,
	SQLiteCategoryRef,
	SQLiteOverview,
	SQLitePageRequest,
	SQLiteParseProgress,
	SQLitePayee,
	SQLiteSectionPage,
	SQLiteSession,
	SQLiteSessionOptions,
	SQLiteTag,
	SQLiteTagRef,
	SQLiteTransaction,
	SQLiteUser,
} from './models'
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

import {
	SQLITE_ACCOUNT_ENTITY_RANGE,
	SQLITE_CORE_ENTITY_IDS,
} from './constants'
import { getSqlite3, openDatabase, readRows, forEachRow } from './engine'
import {
	NAME_COLUMNS,
	getNumberValue,
	getTextValue,
	toAccountRef,
	toBoolean,
	toCoreDataISOString,
	toEntityName,
	toInteger,
} from './helpers'

const SQLITE_IMPORT_DB_NAME = 'moneywiz-sqlite-import'
const SQLITE_IMPORT_DB_VERSION = 1
const MAX_PAGE_LIMIT = 1000

type SQLiteStoreName =
	| 'meta'
	| 'entities'
	| 'accounts'
	| 'payees'
	| 'categories'
	| 'tags'
	| 'users'
	| 'transactions'
	| 'transaction_categories'
	| 'transaction_tags'

interface SQLiteImportDBSchema extends DBSchema {
	meta: {
		key: string
		value: {
			key: string
			value: unknown
		}
	}
	entities: {
		key: number
		value: {
			entityId: number
			entityName: string
			rowCount: number
		}
	}
	accounts: {
		key: number
		value: SQLiteAccount
	}
	payees: {
		key: number
		value: SQLitePayee
	}
	categories: {
		key: number
		value: SQLiteCategory
	}
	tags: {
		key: number
		value: SQLiteTag
	}
	users: {
		key: number
		value: SQLiteUser
	}
	transactions: {
		key: number
		value: SQLiteTransaction
		indexes: {
			id: number
		}
	}
	transaction_categories: {
		key: number
		value: {
			id?: number
			transactionId: number
			category: SQLiteCategoryRef
		}
		indexes: {
			transactionId: number
		}
	}
	transaction_tags: {
		key: number
		value: {
			id?: number
			transactionId: number
			tag: SQLiteTagRef
		}
		indexes: {
			transactionId: number
		}
	}
}

interface SQLiteExtractionContext {
	db: Database
	entityNameById: Map<number, string>
	onProgress?: (progress: SQLiteParseProgress) => void
	idb: IDBPDatabase<SQLiteImportDBSchema>
}

interface SQLiteExtractor {
	phase: SQLiteParseProgress['phase']
	run: (ctx: SQLiteExtractionContext) => Promise<void>
}

const openImportDB = async (): Promise<IDBPDatabase<SQLiteImportDBSchema>> => {
	return openDB<SQLiteImportDBSchema>(
		SQLITE_IMPORT_DB_NAME,
		SQLITE_IMPORT_DB_VERSION,
		{
			upgrade(database) {
				database.createObjectStore('meta', { keyPath: 'key' })
				database.createObjectStore('entities', { keyPath: 'entityId' })
				database.createObjectStore('accounts', { keyPath: 'id' })
				database.createObjectStore('payees', { keyPath: 'id' })
				database.createObjectStore('categories', { keyPath: 'id' })
				database.createObjectStore('tags', { keyPath: 'id' })
				database.createObjectStore('users', { keyPath: 'id' })
				const trx = database.createObjectStore('transactions', {
					autoIncrement: true,
				})
				trx.createIndex('id', 'id', { unique: false })

				const categoryLinks = database.createObjectStore(
					'transaction_categories',
					{
						autoIncrement: true,
					}
				)
				categoryLinks.createIndex('transactionId', 'transactionId', {
					unique: false,
				})

				const tagLinks = database.createObjectStore('transaction_tags', {
					autoIncrement: true,
				})
				tagLinks.createIndex('transactionId', 'transactionId', {
					unique: false,
				})
			},
		}
	)
}

const clearImportStores = async (idb: IDBPDatabase<SQLiteImportDBSchema>) => {
	const trx = idb.transaction(
		[
			'meta',
			'entities',
			'accounts',
			'payees',
			'categories',
			'tags',
			'users',
			'transactions',
			'transaction_categories',
			'transaction_tags',
		],
		'readwrite'
	)

	for (const store of [
		'meta',
		'entities',
		'accounts',
		'payees',
		'categories',
		'tags',
		'users',
		'transactions',
		'transaction_categories',
		'transaction_tags',
	] as SQLiteStoreName[]) {
		await trx.objectStore(store).clear()
	}
	await trx.done
}

const writeMeta = async (
	idb: IDBPDatabase<SQLiteImportDBSchema>,
	key: string,
	value: unknown
) => {
	await idb.put('meta', { key, value })
}

const getMeta = async <T>(
	idb: IDBPDatabase<SQLiteImportDBSchema>,
	key: string
): Promise<T | undefined> => {
	const payload = await idb.get('meta', key)
	return payload?.value as T | undefined
}

const emitProgress = (
	onProgress: SQLiteSessionOptions['onProgress'],
	phase: SQLiteParseProgress['phase'],
	processed: number,
	total?: number
) => {
	onProgress?.({ phase, processed, total })
}

const writeBatch = async <T>(
	idb: IDBPDatabase<SQLiteImportDBSchema>,
	store: SQLiteStoreName,
	items: T[]
) => {
	if (items.length === 0) return
	const trx = idb.transaction(store, 'readwrite')
	for (const item of items) {
		await trx.store.put(item as never)
	}
	await trx.done
}

const createSQLiteExtractionFactory = (extractors: SQLiteExtractor[]) => {
	return {
		run: async (ctx: SQLiteExtractionContext): Promise<void> => {
			for (const extractor of extractors) {
				extractor.run(ctx)
			}
		},
	}
}

const parseEntityLookups = (
	db: Database
): {
	entityNameById: Map<number, string>
	entities: SQLiteOverview['entities']
} => {
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

	const entities = readRows(
		db,
		'SELECT Z_ENT, COUNT(*) AS row_count FROM ZSYNCOBJECT GROUP BY Z_ENT'
	)
		.map((row) => {
			const entityId = toInteger(getNumberValue(row, ['Z_ENT'])) ?? -1
			return {
				entityId,
				entityName: toEntityName(entityNameById, entityId),
				rowCount: toInteger(getNumberValue(row, ['row_count'])) ?? 0,
			}
		})
		.filter((entity) => entity.entityId >= 0)
		.toSorted((left, right) => right.rowCount - left.rowCount)

	return {
		entityNameById,
		entities,
	}
}

const paginateStore = async <T>(
	idb: IDBPDatabase<SQLiteImportDBSchema>,
	store: SQLiteStoreName,
	offset: number,
	limit: number
): Promise<{ total: number; items: T[] }> => {
	const trx = idb.transaction(store, 'readonly')
	const objectStore = trx.objectStore(store)
	const total = await objectStore.count()
	const items: T[] = []
	let cursor = await objectStore.openCursor()
	let skipped = 0
	while (cursor && skipped < offset) {
		skipped += 1
		cursor = await cursor.continue()
	}
	while (cursor && items.length < limit) {
		items.push(cursor.value as T)
		cursor = await cursor.continue()
	}
	await trx.done
	return { total, items }
}

const getTransactionRelations = async (
	idb: IDBPDatabase<SQLiteImportDBSchema>,
	transactionId: number
): Promise<{ categories: SQLiteCategoryRef[]; tags: SQLiteTagRef[] }> => {
	const trx = idb.transaction(['transaction_categories', 'transaction_tags'])
	const categoryRows = await trx
		.objectStore('transaction_categories')
		.index('transactionId')
		.getAll(transactionId)
	const tagRows = await trx
		.objectStore('transaction_tags')
		.index('transactionId')
		.getAll(transactionId)
	await trx.done
	return {
		categories: categoryRows.map((row) => row.category),
		tags: tagRows.map((row) => row.tag),
	}
}

const getPersistedPage = async (
	idb: IDBPDatabase<SQLiteImportDBSchema>,
	request: SQLitePageRequest
): Promise<SQLiteSectionPage> => {
	const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.trunc(request.limit)))
	const offset = Math.max(0, Math.trunc(request.offset))

	switch (request.section) {
		case 'accounts': {
			const page = await paginateStore<SQLiteAccount>(
				idb,
				'accounts',
				offset,
				limit
			)
			return { section: 'accounts', offset, limit, ...page }
		}
		case 'payees': {
			const page = await paginateStore<SQLitePayee>(
				idb,
				'payees',
				offset,
				limit
			)
			return { section: 'payees', offset, limit, ...page }
		}
		case 'categories': {
			const page = await paginateStore<SQLiteCategory>(
				idb,
				'categories',
				offset,
				limit
			)
			return { section: 'categories', offset, limit, ...page }
		}
		case 'tags': {
			const page = await paginateStore<SQLiteTag>(idb, 'tags', offset, limit)
			return { section: 'tags', offset, limit, ...page }
		}
		case 'users': {
			const page = await paginateStore<SQLiteUser>(idb, 'users', offset, limit)
			return { section: 'users', offset, limit, ...page }
		}
		case 'transactions': {
			const page = await paginateStore<SQLiteTransaction>(
				idb,
				'transactions',
				offset,
				limit
			)
			const items = await Promise.all(
				page.items.map(async (item) => {
					const relations = await getTransactionRelations(idb, item.id)
					return {
						...item,
						categories: relations.categories,
						tags: relations.tags,
					}
				})
			)
			return {
				section: 'transactions',
				offset,
				limit,
				total: page.total,
				items,
			}
		}
	}
}

export const createSQLiteSession = async (
	file: File,
	options: SQLiteSessionOptions = {}
): Promise<SQLiteSession> => {
	emitProgress(options.onProgress, 'loading', 0)
	const startedAt = performance.now()
	const [sqlite3, fileBuffer, idb] = await Promise.all([
		getSqlite3(),
		file.arrayBuffer(),
		openImportDB(),
	])

	await clearImportStores(idb)

	const db = openDatabase(sqlite3, fileBuffer)

	try {
		emitProgress(options.onProgress, 'lookups', 0)
		const { entityNameById, entities } = parseEntityLookups(db)
		await writeBatch(idb, 'entities', entities)

		const extractorFactory = createSQLiteExtractionFactory([])
		await extractorFactory.run({
			db,
			entityNameById,
			onProgress: options.onProgress,
			idb,
		})

		const accounts = readRows(
			db,
			`SELECT Z_PK, Z_ENT, ZNAME, ZNAME1, ZNAME2, ZNAME3, ZNAME4, ZNAME5, ZNAME6,
			ZCURRENCYNAME, ZCURRENCYNAME1, ZCURRENCYNAME2, ZCURRENCYNAME3,
			ZARCHIVED
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

		const payees = readRows(
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

		const categories = readRows(
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

		const categoriesById = new Map(
			categories.map((category) => [category.id, category])
		)
		for (const category of categories) {
			if (category.parentId === undefined) continue
			category.parentName = categoriesById.get(category.parentId)?.name
		}

		const tags = readRows(
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

		const users = readRows(
			db,
			'SELECT Z_PK, Z_ENT, ZSYNCUSERID, ZAPPSETTINGS, ZSYNCLOGIN FROM ZUSER ORDER BY Z_PK'
		)
			.map((row) => {
				const id = toInteger(getNumberValue(row, ['Z_PK']))
				if (id === undefined) return undefined
				return {
					id,
					email: getTextValue(row, ['ZSYNCLOGIN']),
					entityId: toInteger(getNumberValue(row, ['Z_ENT'])),
					syncUserId: toInteger(getNumberValue(row, ['ZSYNCUSERID'])),
					appSettingsId: toInteger(getNumberValue(row, ['ZAPPSETTINGS'])),
					isActive: false,
				} as SQLiteUser
			})
			.filter((row): row is SQLiteUser => row !== undefined)

		const activeUserId = toInteger(
			getNumberValue(
				readRows(db, 'SELECT ZCURRENTUSER FROM ZCOMMONSETTINGS LIMIT 1')[0] ??
					{},
				['ZCURRENTUSER']
			)
		)
		for (const user of users) {
			user.isActive = user.id === activeUserId
		}
		const activeUser = users.find((user) => user.isActive)

		await Promise.all([
			writeBatch(idb, 'accounts', accounts),
			writeBatch(idb, 'payees', payees),
			writeBatch(idb, 'categories', categories),
			writeBatch(idb, 'tags', tags),
			writeBatch(idb, 'users', users),
		])

		const accountsById = new Map(
			accounts.map((account) => [account.id, account])
		)
		const payeesById = new Map(payees.map((payee) => [payee.id, payee]))
		const categoriesLookup = new Map(
			categories.map((category) => [category.id, category])
		)
		const tagsLookup = new Map(tags.map((tag) => [tag.id, tag]))

		emitProgress(options.onProgress, 'categories', 0)
		const categoryLinks: SQLiteImportDBSchema['transaction_categories']['value'][] =
			[]
		await forEachRow(
			db,
			'SELECT ZTRANSACTION, ZCATEGORY FROM ZCATEGORYASSIGMENT',
			(row) => {
				const transactionId = toInteger(getNumberValue(row, ['ZTRANSACTION']))
				const categoryId = toInteger(getNumberValue(row, ['ZCATEGORY']))
				if (transactionId === undefined || categoryId === undefined) return
				const category = categoriesLookup.get(categoryId)
				if (!category) return
				categoryLinks.push({
					transactionId,
					category: {
						id: category.id,
						name: category.name,
						parentId: category.parentId,
						parentName: category.parentName,
					},
				})
			}
		)
		await writeBatch(idb, 'transaction_categories', categoryLinks)

		emitProgress(options.onProgress, 'tags', 0)
		const tagLinks: SQLiteImportDBSchema['transaction_tags']['value'][] = []
		await forEachRow(
			db,
			'SELECT Z_36TRANSACTIONS, Z_35TAGS FROM Z_36TAGS',
			(row) => {
				const transactionId = toInteger(
					getNumberValue(row, ['Z_36TRANSACTIONS'])
				)
				const tagId = toInteger(getNumberValue(row, ['Z_35TAGS']))
				if (transactionId === undefined || tagId === undefined) return
				const tag = tagsLookup.get(tagId)
				if (!tag) return
				tagLinks.push({
					transactionId,
					tag: {
						id: tag.id,
						name: tag.name,
					},
				})
			}
		)
		await writeBatch(idb, 'transaction_tags', tagLinks)

		const transactionEntityIds = entities
			.filter((entity) => entity.rowCount > 0)
			.filter((entity) => entity.entityName.endsWith('Transaction'))
			.map((entity) => entity.entityId)

		let transactionTotal = 0
		const transactions: SQLiteTransaction[] = []
		if (transactionEntityIds.length > 0) {
			const placeholders = transactionEntityIds.map(() => '?').join(', ')
			const query = `SELECT
				Z_PK,
				Z_ENT,
				ZDATE,
				ZDATE1,
				ZAMOUNT,
				ZAMOUNT1,
				ZORIGINALAMOUNT,
				ZORIGINALSENDERAMOUNT,
				ZORIGINALRECIPIENTAMOUNT,
				ZORIGINALCURRENCY,
				ZORIGINALSENDERCURRENCY,
				ZORIGINALRECIPIENTCURRENCY,
				ZACCOUNT,
				ZACCOUNT1,
				ZACCOUNT2,
				ZSENDERACCOUNT,
				Z9_SENDERACCOUNT,
				ZRECIPIENTACCOUNT,
				ZRECIPIENTACCOUNT1,
				Z9_RECIPIENTACCOUNT,
				Z9_RECIPIENTACCOUNT1,
				ZPAYEE,
				ZPAYEE1,
				ZPAYEE2,
				ZDESC,
				ZDESC1,
				ZDESC2,
				ZNOTES,
				ZNOTES1,
				ZSTATUS,
				ZSTATUS1,
				ZRECONCILED
			FROM ZSYNCOBJECT
			WHERE Z_ENT IN (${placeholders})
			ORDER BY COALESCE(ZDATE1, ZDATE) DESC, Z_PK DESC`

			emitProgress(options.onProgress, 'transactions', 0)
			await forEachRow(
				db,
				query,
				(row) => {
					const id = toInteger(getNumberValue(row, ['Z_PK']))
					const entityId = toInteger(getNumberValue(row, ['Z_ENT']))
					if (id === undefined || entityId === undefined) return

					const accountId = toInteger(
						getNumberValue(row, ['ZACCOUNT2', 'ZACCOUNT1', 'ZACCOUNT'])
					)
					const senderAccountId = toInteger(
						getNumberValue(row, ['ZSENDERACCOUNT', 'Z9_SENDERACCOUNT'])
					)
					const recipientAccountId = toInteger(
						getNumberValue(row, [
							'ZRECIPIENTACCOUNT1',
							'ZRECIPIENTACCOUNT',
							'Z9_RECIPIENTACCOUNT1',
							'Z9_RECIPIENTACCOUNT',
						])
					)
					const payeeId = toInteger(
						getNumberValue(row, ['ZPAYEE2', 'ZPAYEE1', 'ZPAYEE'])
					)

					const fallbackCurrency =
						(accountId !== undefined
							? accountsById.get(accountId)?.currency
							: undefined) ??
						(senderAccountId !== undefined
							? accountsById.get(senderAccountId)?.currency
							: undefined) ??
						(recipientAccountId !== undefined
							? accountsById.get(recipientAccountId)?.currency
							: undefined)

					transactions.push({
						id,
						entityId,
						entityName: toEntityName(entityNameById, entityId),
						date: toCoreDataISOString(getNumberValue(row, ['ZDATE1', 'ZDATE'])),
						amount: getNumberValue(row, ['ZAMOUNT1', 'ZAMOUNT']),
						originalAmount: getNumberValue(row, [
							'ZORIGINALAMOUNT',
							'ZORIGINALSENDERAMOUNT',
							'ZORIGINALRECIPIENTAMOUNT',
						]),
						currency:
							getTextValue(row, [
								'ZORIGINALCURRENCY',
								'ZORIGINALSENDERCURRENCY',
								'ZORIGINALRECIPIENTCURRENCY',
							]) ?? fallbackCurrency,
						description: getTextValue(row, ['ZDESC2', 'ZDESC1', 'ZDESC']) ?? '',
						memo: getTextValue(row, ['ZNOTES1', 'ZNOTES']) ?? '',
						status: toInteger(getNumberValue(row, ['ZSTATUS1', 'ZSTATUS'])),
						reconciled: toBoolean(getNumberValue(row, ['ZRECONCILED'])),
						account: toAccountRef(accountsById, accountId),
						senderAccount: toAccountRef(accountsById, senderAccountId),
						recipientAccount: toAccountRef(accountsById, recipientAccountId),
						payee:
							payeeId === undefined
								? undefined
								: (payeesById.get(payeeId) ?? {
										id: payeeId,
										name: `Unknown Payee #${payeeId}`,
									}),
						categories: [],
						tags: [],
					})
					transactionTotal += 1
				},
				{ params: transactionEntityIds }
			)
		}

		await writeBatch(idb, 'transactions', transactions)

		const syncObjectRows = entities.reduce(
			(sum, entity) => sum + entity.rowCount,
			0
		)
		const overview: SQLiteOverview = {
			meta: {
				fileName: file.name,
				fileSizeBytes: file.size,
				parsedAt: new Date().toISOString(),
				parseDurationMs: Math.round(performance.now() - startedAt),
			},
			counts: {
				syncObjectRows,
				accounts: accounts.length,
				payees: payees.length,
				categories: categories.length,
				tags: tags.length,
				users: users.length,
				transactions: transactionTotal,
			},
			entities,
			activeUser,
		}

		await writeMeta(idb, 'overview', overview)
		emitProgress(
			options.onProgress,
			'complete',
			transactionTotal,
			transactionTotal
		)

		return {
			overview,
			getPage: (request) => getPersistedPage(idb, request),
			close: async () => {
				idb.close()
			},
		}
	} finally {
		db.close()
	}
}

export const getPersistedOverview = async (): Promise<
	SQLiteOverview | undefined
> => {
	const idb = await openImportDB()
	try {
		return getMeta<SQLiteOverview>(idb, 'overview')
	} finally {
		idb.close()
	}
}

export const clearPersistedSQLiteImport = async (): Promise<void> => {
	const idb = await openImportDB()
	try {
		await clearImportStores(idb)
	} finally {
		idb.close()
	}
}
