import type { ImportOptions, ParsedTransaction } from './models'
import type { SQLiteParseProgress } from '$lib/sqlite/models'
import { classifySQLiteTransaction } from './classifier'
import { isNewBalanceDescription } from './utils'

import { transaction } from '$lib/loggers'
import { parseSQLiteFile } from '$lib/sqlite'
import { SQLITE_ENTITY_ID } from '$lib/sqlite/constants'
import { indexDBV1, STATE_TRX_V1 } from '$utils/stores'

const log = transaction.extends('import')

const DEFAULT_BATCH_SIZE = 2000

const insertBatch = async (
	transactions: ParsedTransaction[]
): Promise<void> => {
	const trx = await indexDBV1.transaction(STATE_TRX_V1, 'readwrite')
	for (const t of transactions) {
		trx.store.put(t)
	}
	await trx.done
}

const toImportPercentage = (progress: SQLiteParseProgress): number => {
	if (!progress.total || progress.total <= 0) return 0
	return Math.min(99, Math.round((progress.processed / progress.total) * 100))
}

export const importTransactionsFromFile = async (
	file: File,
	options: ImportOptions = {}
): Promise<number> => {
	const { batchSize = DEFAULT_BATCH_SIZE, onProgress } = options
	if (file.size === 0) {
		const error = new Error('File is empty')
		onProgress?.({
			phase: 'error',
			processed: 0,
			total: 0,
			percentage: 0,
			error,
		})
		throw error
	}

	log.debug('starting import: %s (size=%d)', file.name, file.size)

	onProgress?.({
		phase: 'parsing',
		processed: 0,
		total: 0,
		percentage: 0,
	})

	const result = await parseSQLiteFile(file, {
		onProgress: (progress) => {
			onProgress?.({
				phase: 'parsing',
				processed: progress.processed,
				total: progress.total ?? 0,
				percentage: toImportPercentage(progress),
			})
		},
	})

	const normalizedBatchSize = Math.max(1, batchSize)
	const total = result.transactions.length
	let processedRows = 0
	let batch: ParsedTransaction[] = []

	const flushBatch = async () => {
		if (batch.length === 0) return

		const pending = batch
		batch = []
		await insertBatch(pending)
		processedRows += pending.length

		// Yield between chunk writes to keep UI responsive during large imports.
		await new Promise((resolve) => setTimeout(resolve, 0))
	}

	onProgress?.({
		phase: 'importing',
		processed: 0,
		total,
		percentage: 0,
	})

	for (const sqliteTransaction of result.transactions) {
		if (
			sqliteTransaction.entityId !== SQLITE_ENTITY_ID.ReconcileTransaction &&
			sqliteTransaction.categories.length === 0 &&
			isNewBalanceDescription(sqliteTransaction.description)
		) {
			continue
		}
		const trx = classifySQLiteTransaction(sqliteTransaction)
		batch.push(trx)

		if (batch.length >= normalizedBatchSize) {
			await flushBatch()
			onProgress?.({
				phase: 'importing',
				processed: processedRows,
				total,
				percentage: Math.min(99, Math.round((processedRows / total) * 100)),
			})
		}
	}

	await flushBatch()

	onProgress?.({
		phase: 'complete',
		processed: processedRows,
		total,
		percentage: 100,
	})

	log.debug('import complete: %d transactions', processedRows)
	return processedRows
}

export const clearTransactions = async (): Promise<void> => {
	log.debug('clearing all transactions')
	await indexDBV1.delete(STATE_TRX_V1)
}

export const getTransactionCount = async (): Promise<number> => {
	const trx = await indexDBV1.transaction(STATE_TRX_V1, 'readonly')
	return trx.store.count()
}

export const getTransactions = async (
	limit?: number
): Promise<ParsedTransaction[]> => {
	const trx = await indexDBV1.transaction(STATE_TRX_V1, 'readonly')
	return trx.store.getAll(undefined, limit) as Promise<ParsedTransaction[]>
}
