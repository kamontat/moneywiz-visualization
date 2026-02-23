import type { BindingSpec, Database } from '@sqlite.org/sqlite-wasm'
import type {
	SQLiteExtractionSummary,
	SQLiteLookups,
	SQLiteRelations,
	SQLiteTransactionHandler,
	SQLiteTransaction,
} from '$lib/source/sqlite/models'
import type { SqlRow } from '$lib/source/sqlite/worker/utils'
import {
	getNumberValue,
	getTextValue,
	toAccountRef,
	toBoolean,
	toCoreDataISOString,
	toEntityName,
	toInteger,
} from '$lib/source/sqlite/worker/utils'

const TRANSACTION_QUERY_COLUMNS = `SELECT
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
WHERE Z_ENT IN (__ENTITY_PLACEHOLDERS__)
ORDER BY COALESCE(ZDATE1, ZDATE) DESC, Z_PK DESC`

export const streamTransactions = async (
	db: Database,
	lookups: SQLiteLookups,
	relations: SQLiteRelations,
	onTransaction: SQLiteTransactionHandler,
	onProgress?: (processed: number, total: number) => void
): Promise<SQLiteExtractionSummary> => {
	const transactionEntityIds = lookups.entities
		.filter((entity) => entity.rowCount > 0)
		.filter((entity) => entity.entityName.endsWith('Transaction'))
		.map((entity) => entity.entityId)

	if (transactionEntityIds.length === 0) {
		return {
			transactionCount: 0,
			syncObjectRows: lookups.entities.reduce(
				(sum, entity) => sum + entity.rowCount,
				0
			),
		}
	}

	const transactionTotal = lookups.entities
		.filter((entity) => transactionEntityIds.includes(entity.entityId))
		.reduce((sum, entity) => sum + entity.rowCount, 0)

	const placeholders = transactionEntityIds.map(() => '?').join(', ')
	const query = TRANSACTION_QUERY_COLUMNS.replace(
		'__ENTITY_PLACEHOLDERS__',
		placeholders
	)
	const statement = db.prepare(query)
	statement.bind(transactionEntityIds as BindingSpec)

	const accountsById = new Map(lookups.accounts.map((row) => [row.id, row]))
	const payeesById = new Map(lookups.payees.map((row) => [row.id, row]))

	let processed = 0
	try {
		while (statement.step()) {
			const row = statement.get({}) as SqlRow
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

			const transaction: SQLiteTransaction = {
				id,
				entityId,
				entityName: toEntityName(lookups.entityNameById, entityId),
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
				categories: [...(relations.categoriesByTransaction.get(id) ?? [])],
				tags: [...(relations.tagsByTransaction.get(id) ?? [])],
			}

			await onTransaction(transaction)
			processed += 1
			onProgress?.(processed, transactionTotal)
		}
	} finally {
		statement.finalize()
	}

	return {
		transactionCount: processed,
		syncObjectRows: lookups.entities.reduce(
			(sum, entity) => sum + entity.rowCount,
			0
		),
	}
}
