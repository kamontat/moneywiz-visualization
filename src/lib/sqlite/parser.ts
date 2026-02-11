import type { SqlDatabase, SqlJsStatic } from 'sql.js/dist/sql-wasm.js'
import type {
	ParseSQLiteOptions,
	SQLiteAccount,
	SQLiteAccountRef,
	SQLiteCategory,
	SQLiteCategoryRef,
	SQLiteEntityCount,
	SQLiteParseProgress,
	SQLiteParseResult,
	SQLitePayee,
	SQLitePayeeRef,
	SQLiteTag,
	SQLiteTagRef,
	SQLiteTransaction,
} from './models'

type SqlRow = Record<string, unknown>

const APPLE_REFERENCE_EPOCH_MS = Date.UTC(2001, 0, 1, 0, 0, 0)
const ROW_YIELD_INTERVAL = 500

const NAME_COLUMNS = [
	'ZNAME',
	'ZNAME1',
	'ZNAME2',
	'ZNAME3',
	'ZNAME4',
	'ZNAME5',
	'ZNAME6',
] as const

const CURRENCY_COLUMNS = [
	'ZORIGINALCURRENCY',
	'ZORIGINALSENDERCURRENCY',
	'ZORIGINALRECIPIENTCURRENCY',
	'ZCURRENCYNAME',
	'ZCURRENCYNAME1',
	'ZCURRENCYNAME2',
	'ZCURRENCYNAME3',
] as const

let sqlEnginePromise: Promise<SqlJsStatic> | undefined

const nextTick = async (): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, 0))

const emitProgress = (
	options: ParseSQLiteOptions,
	progress: SQLiteParseProgress
) => {
	options.onProgress?.(progress)
}

const getTextValue = (
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

const getNumberValue = (
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

const toInteger = (value: number | undefined): number | undefined =>
	value === undefined ? undefined : Math.trunc(value)

const toBoolean = (value: number | undefined): boolean | undefined =>
	value === undefined ? undefined : value !== 0

const toCoreDataISOString = (
	timestamp: number | undefined
): string | undefined => {
	if (timestamp === undefined || !Number.isFinite(timestamp)) return undefined
	const milliseconds = APPLE_REFERENCE_EPOCH_MS + timestamp * 1000
	return new Date(milliseconds).toISOString()
}

const getSqlEngine = async (): Promise<SqlJsStatic> => {
	if (!sqlEnginePromise) {
		sqlEnginePromise = (async () => {
			const [{ default: initSqlJs }, { default: wasmUrl }] = await Promise.all([
				import('sql.js/dist/sql-wasm.js'),
				import('sql.js/dist/sql-wasm.wasm?url'),
			])

			return initSqlJs({
				locateFile: () => wasmUrl,
			})
		})()
	}

	return sqlEnginePromise
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

const forEachRow = async (
	db: SqlDatabase,
	query: string,
	onRow: (row: SqlRow) => void,
	options: {
		params?: unknown[]
		yieldEvery?: number
		onProgress?: (processed: number) => void
	} = {}
): Promise<number> => {
	const { params = [], yieldEvery = ROW_YIELD_INTERVAL, onProgress } = options
	const statement = db.prepare(query, params)
	let processed = 0

	try {
		while (statement.step()) {
			onRow(statement.getAsObject() as SqlRow)
			processed += 1
			onProgress?.(processed)

			if (processed % yieldEvery === 0) {
				await nextTick()
			}
		}
	} finally {
		statement.free()
	}

	return processed
}

const pushGrouped = <T>(
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

const toEntityName = (
	entityNames: Map<number, string>,
	entityId: number
): string => entityNames.get(entityId) ?? `Entity ${entityId}`

const toAccountRef = (
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

const toPayeeRef = (
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

export const parseSQLiteFile = async (
	file: File,
	options: ParseSQLiteOptions = {}
): Promise<SQLiteParseResult> => {
	const startedAt = performance.now()
	emitProgress(options, { phase: 'loading', processed: 0 })

	const [sqlEngine, fileBuffer] = await Promise.all([
		getSqlEngine(),
		file.arrayBuffer(),
	])

	const data = new Uint8Array(fileBuffer)
	const db = new sqlEngine.Database(data)

	try {
		emitProgress(options, { phase: 'lookups', processed: 0 })

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

		const entityCountRows = readRows(
			db,
			'SELECT Z_ENT, COUNT(*) AS row_count FROM ZSYNCOBJECT GROUP BY Z_ENT'
		)
		const entities: SQLiteEntityCount[] = entityCountRows
			.map((row) => {
				const entityId = toInteger(getNumberValue(row, ['Z_ENT'])) ?? -1
				const rowCount = toInteger(getNumberValue(row, ['row_count'])) ?? 0
				return {
					entityId,
					entityName: toEntityName(entityNameById, entityId),
					rowCount,
				} as SQLiteEntityCount
			})
			.filter((entity) => entity.entityId >= 0)
			.toSorted((left, right) => right.rowCount - left.rowCount)

		const accountRows = readRows(
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
		const accounts: SQLiteAccount[] = accountRows
			.map((row) => {
				const id = toInteger(getNumberValue(row, ['Z_PK']))
				const entityId = toInteger(getNumberValue(row, ['Z_ENT']))
				if (id === undefined || entityId === undefined) return undefined
				return {
					id,
					entityId,
					entityName: toEntityName(entityNameById, entityId),
					name: getTextValue(row, NAME_COLUMNS) ?? `Account #${id}`,
					currency: getTextValue(row, CURRENCY_COLUMNS),
				} as SQLiteAccount
			})
			.filter((account): account is SQLiteAccount => account !== undefined)

		const payeeRows = readRows(
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
		const payees: SQLitePayee[] = payeeRows
			.map((row) => {
				const id = toInteger(getNumberValue(row, ['Z_PK']))
				if (id === undefined) return undefined
				return {
					id,
					name: getTextValue(row, NAME_COLUMNS) ?? `Payee #${id}`,
				} as SQLitePayee
			})
			.filter((payee): payee is SQLitePayee => payee !== undefined)

		const tagRows = readRows(
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
		const tags: SQLiteTag[] = tagRows
			.map((row) => {
				const id = toInteger(getNumberValue(row, ['Z_PK']))
				if (id === undefined) return undefined
				return {
					id,
					name: getTextValue(row, NAME_COLUMNS) ?? `Tag #${id}`,
				} as SQLiteTag
			})
			.filter((tag): tag is SQLiteTag => tag !== undefined)

		const categoryRows = readRows(
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
		const categories: SQLiteCategory[] = categoryRows
			.map((row) => {
				const id = toInteger(getNumberValue(row, ['Z_PK']))
				if (id === undefined) return undefined
				return {
					id,
					name: getTextValue(row, NAME_COLUMNS) ?? `Category #${id}`,
					parentId: toInteger(getNumberValue(row, ['ZPARENTCATEGORY'])),
				} as SQLiteCategory
			})
			.filter((category): category is SQLiteCategory => category !== undefined)
		const categoriesById = new Map<number, SQLiteCategory>(
			categories.map((category) => [category.id, category])
		)
		for (const category of categories) {
			if (category.parentId === undefined) continue
			category.parentName = categoriesById.get(category.parentId)?.name
		}

		const accountsById = new Map<number, SQLiteAccount>(
			accounts.map((account) => [account.id, account])
		)
		const payeesById = new Map<number, SQLitePayee>(
			payees.map((payee) => [payee.id, payee])
		)
		const tagsById = new Map<number, SQLiteTag>(
			tags.map((tag) => [tag.id, tag])
		)

		emitProgress(options, { phase: 'categories', processed: 0 })
		const categoriesByTransaction = new Map<number, SQLiteCategoryRef[]>()
		await forEachRow(
			db,
			'SELECT ZTRANSACTION, ZCATEGORY FROM ZCATEGORYASSIGMENT',
			(row) => {
				const transactionId = toInteger(getNumberValue(row, ['ZTRANSACTION']))
				const categoryId = toInteger(getNumberValue(row, ['ZCATEGORY']))
				if (transactionId === undefined || categoryId === undefined) return

				const category = categoriesById.get(categoryId)
				if (!category) return

				pushGrouped(categoriesByTransaction, transactionId, {
					id: category.id,
					name: category.name,
					parentId: category.parentId,
					parentName: category.parentName,
				})
			},
			{
				onProgress: (processed) => {
					emitProgress(options, {
						phase: 'categories',
						processed,
					})
				},
			}
		)

		emitProgress(options, { phase: 'tags', processed: 0 })
		const tagsByTransaction = new Map<number, SQLiteTagRef[]>()
		await forEachRow(
			db,
			'SELECT Z_36TRANSACTIONS, Z_35TAGS FROM Z_36TAGS',
			(row) => {
				const transactionId = toInteger(
					getNumberValue(row, ['Z_36TRANSACTIONS'])
				)
				const tagId = toInteger(getNumberValue(row, ['Z_35TAGS']))
				if (transactionId === undefined || tagId === undefined) return

				const tag = tagsById.get(tagId)
				if (!tag) return

				pushGrouped(tagsByTransaction, transactionId, {
					id: tag.id,
					name: tag.name,
				})
			},
			{
				onProgress: (processed) => {
					emitProgress(options, {
						phase: 'tags',
						processed,
					})
				},
			}
		)

		const transactionEntityIds = entities
			.filter((entity) => entity.rowCount > 0)
			.filter((entity) => entity.entityName.endsWith('Transaction'))
			.map((entity) => entity.entityId)

		const transactionEntitySet = new Set(transactionEntityIds)
		const estimatedTransactionCount = entities
			.filter((entity) => transactionEntitySet.has(entity.entityId))
			.reduce((sum, entity) => sum + entity.rowCount, 0)

		const normalizedMaxTransactions =
			typeof options.maxTransactions === 'number' && options.maxTransactions > 0
				? Math.trunc(options.maxTransactions)
				: undefined

		const transactions: SQLiteTransaction[] = []
		if (transactionEntityIds.length > 0) {
			const placeholders = transactionEntityIds.map(() => '?').join(', ')
			const params: number[] = [...transactionEntityIds]
			let transactionQuery = `SELECT
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
				Z9_ACCOUNT,
				ZACCOUNT1,
				Z9_ACCOUNT1,
				ZACCOUNT2,
				Z9_ACCOUNT2,
				ZSENDERACCOUNT,
				Z9_SENDERACCOUNT,
				ZRECIPIENTACCOUNT,
				Z9_RECIPIENTACCOUNT,
				ZRECIPIENTACCOUNT1,
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
			ORDER BY Z_PK`

			if (normalizedMaxTransactions !== undefined) {
				transactionQuery += '\nLIMIT ?'
				params.push(normalizedMaxTransactions)
			}

			emitProgress(options, {
				phase: 'transactions',
				processed: 0,
				total: normalizedMaxTransactions ?? estimatedTransactionCount,
			})
			await forEachRow(
				db,
				transactionQuery,
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

					const accountRef = toAccountRef(accountsById, accountId)
					const senderAccountRef = toAccountRef(accountsById, senderAccountId)
					const recipientAccountRef = toAccountRef(
						accountsById,
						recipientAccountId
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

					const amount = getNumberValue(row, ['ZAMOUNT1', 'ZAMOUNT'])
					const originalAmount = getNumberValue(row, [
						'ZORIGINALAMOUNT',
						'ZORIGINALSENDERAMOUNT',
						'ZORIGINALRECIPIENTAMOUNT',
					])
					const categoryRefs = categoriesByTransaction.get(id) ?? []
					const tagRefs = tagsByTransaction.get(id) ?? []

					transactions.push({
						id,
						entityId,
						entityName: toEntityName(entityNameById, entityId),
						date: toCoreDataISOString(getNumberValue(row, ['ZDATE1', 'ZDATE'])),
						amount,
						originalAmount,
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
						payee: toPayeeRef(payeesById, payeeId),
						categories: categoryRefs,
						tags: tagRefs,
					})
				},
				{
					params,
					onProgress: (processed) => {
						emitProgress(options, {
							phase: 'transactions',
							processed,
							total: normalizedMaxTransactions ?? estimatedTransactionCount,
						})
					},
				}
			)
		}

		const syncObjectRows = entities.reduce(
			(sum, entity) => sum + entity.rowCount,
			0
		)
		const result: SQLiteParseResult = {
			meta: {
				fileName: file.name,
				fileSizeBytes: file.size,
				parsedAt: new Date().toISOString(),
				parseDurationMs: Math.round(performance.now() - startedAt),
				maxTransactions: normalizedMaxTransactions,
			},
			counts: {
				syncObjectRows,
				accounts: accounts.length,
				payees: payees.length,
				categories: categories.length,
				tags: tags.length,
				transactions: transactions.length,
			},
			entities,
			accounts,
			payees,
			categories,
			tags,
			transactions,
		}

		emitProgress(options, {
			phase: 'complete',
			processed: transactions.length,
			total: transactions.length,
		})
		return result
	} finally {
		db.close()
	}
}
