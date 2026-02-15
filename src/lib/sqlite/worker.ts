/// <reference lib="webworker" />

import type { SqlDatabase, SqlJsStatic } from 'sql.js/dist/sql-wasm.js'
import type {
	SQLiteAccount,
	SQLiteCategory,
	SQLiteCategoryRef,
	SQLiteEntityCount,
	SQLiteOverview,
	SQLitePayee,
	SQLitePageRequest,
	SQLiteSection,
	SQLiteSectionPage,
	SQLiteTag,
	SQLiteTagRef,
	SQLiteTransaction,
	SQLiteWorkerRequest,
	SQLiteWorkerResponse,
} from './models'
import initSqlJs from 'sql.js/dist/sql-wasm.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

import {
	type SqlRow,
	NAME_COLUMNS,
	getNumberValue,
	getTextValue,
	pushGrouped,
	toAccountRef,
	toBoolean,
	toCoreDataISOString,
	toEntityName,
	toInteger,
} from './helpers'

const workerScope = self as DedicatedWorkerGlobalScope

const RELATION_PROGRESS_INTERVAL = 1000
const MAX_PAGE_LIMIT = 1000

interface SQLiteRuntime {
	db: SqlDatabase
	entityNameById: Map<number, string>
	entities: SQLiteEntityCount[]
	accounts: SQLiteAccount[]
	payees: SQLitePayee[]
	categories: SQLiteCategory[]
	tags: SQLiteTag[]
	accountsById: Map<number, SQLiteAccount>
	payeesById: Map<number, SQLitePayee>
	categoriesByTransaction: Map<number, SQLiteCategoryRef[]>
	tagsByTransaction: Map<number, SQLiteTagRef[]>
	transactionEntityIds: number[]
	transactionTotal: number
	overview: SQLiteOverview
}

let sqlEnginePromise: Promise<SqlJsStatic> | undefined
let runtime: SQLiteRuntime | undefined

const closeRuntime = (): void => {
	if (!runtime) return
	runtime.db.close()
	runtime = undefined
}

const postResponse = (payload: SQLiteWorkerResponse): void => {
	workerScope.postMessage(payload)
}

const readRows = (
	db: SqlDatabase,
	query: string,
	params: unknown[] = []
): SqlRow[] => {
	const statement = db.prepare(query, params)
	const rows: SqlRow[] = []
	try {
		while (statement.step()) {
			rows.push(statement.getAsObject() as SqlRow)
		}
	} finally {
		statement.free()
	}
	return rows
}

const getSqlEngine = async (): Promise<SqlJsStatic> => {
	if (!sqlEnginePromise) {
		sqlEnginePromise = initSqlJs({
			locateFile: () => wasmUrl,
		})
	}
	return sqlEnginePromise
}

const parseBaseLookups = (
	db: SqlDatabase
): {
	entityNameById: Map<number, string>
	entities: SQLiteEntityCount[]
	accounts: SQLiteAccount[]
	payees: SQLitePayee[]
	categories: SQLiteCategory[]
	tags: SQLiteTag[]
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
			} as SQLiteEntityCount
		})
		.filter((row) => row.entityId >= 0)
		.toSorted((left, right) => right.rowCount - left.rowCount)

	const accounts = readRows(
		db,
		`SELECT
			Z_PK,
			Z_ENT,
			ZNAME,
			ZNAME1,
			ZNAME2,
			ZNAME3,
			ZNAME4,
			ZNAME5,
			ZNAME6,
			ZCURRENCYNAME,
			ZCURRENCYNAME1,
			ZCURRENCYNAME2,
			ZCURRENCYNAME3
		FROM ZSYNCOBJECT
		WHERE Z_ENT BETWEEN 10 AND 16
		ORDER BY Z_PK`
	)
		.map((row) => {
			const id = toInteger(getNumberValue(row, ['Z_PK']))
			const entityId = toInteger(getNumberValue(row, ['Z_ENT']))
			if (id === undefined || entityId === undefined) return undefined

			const currency = getTextValue(row, [
				'ZCURRENCYNAME',
				'ZCURRENCYNAME1',
				'ZCURRENCYNAME2',
				'ZCURRENCYNAME3',
			])

			return {
				id,
				entityId,
				entityName: toEntityName(entityNameById, entityId),
				name: getTextValue(row, NAME_COLUMNS) ?? `Account #${id}`,
				currency,
			} as SQLiteAccount
		})
		.filter((row): row is SQLiteAccount => row !== undefined)

	const payees = readRows(
		db,
		`SELECT
			Z_PK,
			ZNAME,
			ZNAME1,
			ZNAME2,
			ZNAME3,
			ZNAME4,
			ZNAME5,
			ZNAME6
		FROM ZSYNCOBJECT
		WHERE Z_ENT = 28
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
		`SELECT
			Z_PK,
			ZPARENTCATEGORY,
			ZNAME,
			ZNAME1,
			ZNAME2,
			ZNAME3,
			ZNAME4,
			ZNAME5,
			ZNAME6
		FROM ZSYNCOBJECT
		WHERE Z_ENT = 19
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
		`SELECT
			Z_PK,
			ZNAME,
			ZNAME1,
			ZNAME2,
			ZNAME3,
			ZNAME4,
			ZNAME5,
			ZNAME6
		FROM ZSYNCOBJECT
		WHERE Z_ENT = 35
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

	return {
		entityNameById,
		entities,
		accounts,
		payees,
		categories,
		tags,
	}
}

const buildRelationMaps = (
	requestId: string,
	db: SqlDatabase,
	categories: SQLiteCategory[],
	tags: SQLiteTag[]
): {
	categoriesByTransaction: Map<number, SQLiteCategoryRef[]>
	tagsByTransaction: Map<number, SQLiteTagRef[]>
} => {
	const categoriesById = new Map(
		categories.map((category) => [category.id, category])
	)
	const tagsById = new Map(tags.map((tag) => [tag.id, tag]))

	const categoriesByTransaction = new Map<number, SQLiteCategoryRef[]>()
	const categoryStatement = db.prepare(
		'SELECT ZTRANSACTION, ZCATEGORY FROM ZCATEGORYASSIGMENT'
	)
	let categoryProcessed = 0
	try {
		while (categoryStatement.step()) {
			const row = categoryStatement.getAsObject() as SqlRow
			const transactionId = toInteger(getNumberValue(row, ['ZTRANSACTION']))
			const categoryId = toInteger(getNumberValue(row, ['ZCATEGORY']))
			if (transactionId === undefined || categoryId === undefined) continue

			const category = categoriesById.get(categoryId)
			if (!category) continue
			pushGrouped(categoriesByTransaction, transactionId, {
				id: category.id,
				name: category.name,
				parentId: category.parentId,
				parentName: category.parentName,
			})

			categoryProcessed += 1
			if (categoryProcessed % RELATION_PROGRESS_INTERVAL === 0) {
				postResponse({
					id: requestId,
					action: 'open',
					status: 'progress',
					progress: {
						phase: 'categories',
						processed: categoryProcessed,
					},
				})
			}
		}
	} finally {
		categoryStatement.free()
	}

	const tagsByTransaction = new Map<number, SQLiteTagRef[]>()
	const tagStatement = db.prepare(
		'SELECT Z_36TRANSACTIONS, Z_35TAGS FROM Z_36TAGS'
	)
	let tagProcessed = 0
	try {
		while (tagStatement.step()) {
			const row = tagStatement.getAsObject() as SqlRow
			const transactionId = toInteger(getNumberValue(row, ['Z_36TRANSACTIONS']))
			const tagId = toInteger(getNumberValue(row, ['Z_35TAGS']))
			if (transactionId === undefined || tagId === undefined) continue

			const tag = tagsById.get(tagId)
			if (!tag) continue
			pushGrouped(tagsByTransaction, transactionId, {
				id: tag.id,
				name: tag.name,
			})

			tagProcessed += 1
			if (tagProcessed % RELATION_PROGRESS_INTERVAL === 0) {
				postResponse({
					id: requestId,
					action: 'open',
					status: 'progress',
					progress: {
						phase: 'tags',
						processed: tagProcessed,
					},
				})
			}
		}
	} finally {
		tagStatement.free()
	}

	return {
		categoriesByTransaction,
		tagsByTransaction,
	}
}

const loadTransactionsPage = (
	state: SQLiteRuntime,
	offset: number,
	limit: number
): SQLiteSectionPage => {
	if (state.transactionEntityIds.length === 0) {
		return {
			section: 'transactions',
			offset,
			limit,
			total: 0,
			items: [],
		}
	}

	const placeholders = state.transactionEntityIds.map(() => '?').join(', ')
	const statement = state.db.prepare(
		`SELECT
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
			Z9_ACCOUNT,
			Z9_ACCOUNT1,
			Z9_ACCOUNT2,
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
		ORDER BY COALESCE(ZDATE1, ZDATE) DESC, Z_PK DESC
		LIMIT ? OFFSET ?`,
		[...state.transactionEntityIds, limit, offset]
	)

	const transactions: SQLiteTransaction[] = []
	try {
		while (statement.step()) {
			const row = statement.getAsObject() as SqlRow
			const id = toInteger(getNumberValue(row, ['Z_PK']))
			const entityId = toInteger(getNumberValue(row, ['Z_ENT']))
			if (id === undefined || entityId === undefined) continue

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

			const accountRef = toAccountRef(state.accountsById, accountId)
			const senderAccountRef = toAccountRef(state.accountsById, senderAccountId)
			const recipientAccountRef = toAccountRef(
				state.accountsById,
				recipientAccountId
			)

			const fallbackCurrency =
				(accountId !== undefined
					? state.accountsById.get(accountId)?.currency
					: undefined) ??
				(senderAccountId !== undefined
					? state.accountsById.get(senderAccountId)?.currency
					: undefined) ??
				(recipientAccountId !== undefined
					? state.accountsById.get(recipientAccountId)?.currency
					: undefined)

			transactions.push({
				id,
				entityId,
				entityName: toEntityName(state.entityNameById, entityId),
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
				account: accountRef,
				senderAccount: senderAccountRef,
				recipientAccount: recipientAccountRef,
				payee:
					payeeId === undefined
						? undefined
						: (state.payeesById.get(payeeId) ?? {
								id: payeeId,
								name: `Unknown Payee #${payeeId}`,
							}),
				categories: [...(state.categoriesByTransaction.get(id) ?? [])],
				tags: [...(state.tagsByTransaction.get(id) ?? [])],
			})
		}
	} finally {
		statement.free()
	}

	return {
		section: 'transactions',
		offset,
		limit,
		total: state.transactionTotal,
		items: transactions,
	}
}

const loadPage = (request: SQLitePageRequest): SQLiteSectionPage => {
	if (!runtime) {
		throw new Error('SQLite session is not initialized')
	}

	const section: SQLiteSection = request.section
	const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.trunc(request.limit)))
	const offset = Math.max(0, Math.trunc(request.offset))

	switch (section) {
		case 'accounts':
			return {
				section,
				offset,
				limit,
				total: runtime.accounts.length,
				items: runtime.accounts.slice(offset, offset + limit),
			}
		case 'payees':
			return {
				section,
				offset,
				limit,
				total: runtime.payees.length,
				items: runtime.payees.slice(offset, offset + limit),
			}
		case 'categories':
			return {
				section,
				offset,
				limit,
				total: runtime.categories.length,
				items: runtime.categories.slice(offset, offset + limit),
			}
		case 'tags':
			return {
				section,
				offset,
				limit,
				total: runtime.tags.length,
				items: runtime.tags.slice(offset, offset + limit),
			}
		case 'transactions':
			return loadTransactionsPage(runtime, offset, limit)
	}
}

const openRuntime = async (
	requestId: string,
	payload: { fileName: string; fileSizeBytes: number; buffer: ArrayBuffer }
): Promise<SQLiteOverview> => {
	closeRuntime()
	const startedAt = performance.now()

	postResponse({
		id: requestId,
		action: 'open',
		status: 'progress',
		progress: {
			phase: 'loading',
			processed: 0,
		},
	})

	const sqlEngine = await getSqlEngine()
	const db = new sqlEngine.Database(new Uint8Array(payload.buffer))

	postResponse({
		id: requestId,
		action: 'open',
		status: 'progress',
		progress: {
			phase: 'lookups',
			processed: 0,
		},
	})

	const base = parseBaseLookups(db)
	const transactionEntityIds = base.entities
		.filter((entity) => entity.rowCount > 0)
		.filter((entity) => entity.entityName.endsWith('Transaction'))
		.map((entity) => entity.entityId)

	const transactionEntitySet = new Set(transactionEntityIds)
	const transactionTotal = base.entities
		.filter((entity) => transactionEntitySet.has(entity.entityId))
		.reduce((sum, entity) => sum + entity.rowCount, 0)

	const relations = buildRelationMaps(requestId, db, base.categories, base.tags)

	const syncObjectRows = base.entities.reduce(
		(sum, entity) => sum + entity.rowCount,
		0
	)
	const overview: SQLiteOverview = {
		meta: {
			fileName: payload.fileName,
			fileSizeBytes: payload.fileSizeBytes,
			parsedAt: new Date().toISOString(),
			parseDurationMs: Math.round(performance.now() - startedAt),
		},
		counts: {
			syncObjectRows,
			accounts: base.accounts.length,
			payees: base.payees.length,
			categories: base.categories.length,
			tags: base.tags.length,
			transactions: transactionTotal,
		},
		entities: base.entities,
	}

	runtime = {
		db,
		entityNameById: base.entityNameById,
		entities: base.entities,
		accounts: base.accounts,
		payees: base.payees,
		categories: base.categories,
		tags: base.tags,
		accountsById: new Map(
			base.accounts.map((account) => [account.id, account])
		),
		payeesById: new Map(base.payees.map((payee) => [payee.id, payee])),
		categoriesByTransaction: relations.categoriesByTransaction,
		tagsByTransaction: relations.tagsByTransaction,
		transactionEntityIds,
		transactionTotal,
		overview,
	}

	postResponse({
		id: requestId,
		action: 'open',
		status: 'progress',
		progress: {
			phase: 'complete',
			processed: transactionTotal,
			total: transactionTotal,
		},
	})

	return overview
}

workerScope.onmessage = async (event: MessageEvent<SQLiteWorkerRequest>) => {
	const message = event.data
	if (!message) return

	try {
		switch (message.action) {
			case 'open': {
				const overview = await openRuntime(message.id, message.payload)
				postResponse({
					id: message.id,
					action: 'open',
					status: 'ok',
					data: overview,
				})
				return
			}
			case 'getPage': {
				const page = loadPage(message.payload)
				postResponse({
					id: message.id,
					action: 'getPage',
					status: 'ok',
					data: page,
				})
				return
			}
			case 'close': {
				closeRuntime()
				postResponse({
					id: message.id,
					action: 'close',
					status: 'ok',
					data: { closed: true },
				})
				return
			}
		}
	} catch (error) {
		postResponse({
			id: message.id,
			action: message.action,
			status: 'error',
			error: error instanceof Error ? error.message : String(error),
		})
	}
}
