import type { Database } from '@sqlite.org/sqlite-wasm'
import type { ParsedTransaction } from '$lib/ledger/models'
import type { SessionProgress } from '$lib/session/models'
import { mapSQLiteTransaction } from '$lib/ledger/importer'
import {
	shouldSkipParsedTransaction,
	shouldSkipSQLiteTransaction,
} from '$lib/ledger/importer/filter-rules'
import {
	clearLedgerMeta,
	clearLedgerTransactions,
	markSnapshotReady,
	putLedgerTransactionBatch,
	setLedgerMeta,
} from '$lib/ledger/repository'
import {
	extractLookups,
	extractRelations,
	streamTransactions,
} from '$lib/source/sqlite/worker/extractors'
import { flushBatch, yieldToWorkerLoop } from '$lib/source/sqlite/worker/utils'

const DEFAULT_BATCH_SIZE = 1000
const YIELD_EVERY = 500

const toPercentage = (processed: number, total: number): number => {
	if (total <= 0) return 0
	return Math.min(99, Math.round((processed / total) * 100))
}

const reportProgress = (
	onProgress: ((progress: SessionProgress) => void) | undefined,
	progress: SessionProgress
) => {
	onProgress?.(progress)
}

export const rebuildSnapshotFromDatabase = async (
	db: Database,
	onProgress?: (progress: SessionProgress) => void
): Promise<{ transactionCount: number; syncObjectRows: number }> => {
	reportProgress(onProgress, { phase: 'lookups', processed: 0, percentage: 0 })
	const lookups = extractLookups(db)

	reportProgress(onProgress, {
		phase: 'relations',
		processed: 0,
		percentage: 0,
	})
	const relations = extractRelations(db, {
		categories: lookups.categories,
		tags: lookups.tags,
	})

	await Promise.all([clearLedgerTransactions(), clearLedgerMeta()])

	let sourceProcessed = 0
	let persistedCount = 0
	const batch: ParsedTransaction[] = []

	reportProgress(onProgress, {
		phase: 'transactions',
		processed: 0,
		total: 0,
		percentage: 0,
	})

	const summary = await streamTransactions(
		db,
		lookups,
		relations,
		async (transaction) => {
			sourceProcessed += 1
			if (shouldSkipSQLiteTransaction(transaction)) return

			const parsed = mapSQLiteTransaction(transaction)
			if (shouldSkipParsedTransaction(parsed)) return

			batch.push(parsed)
			if (batch.length >= DEFAULT_BATCH_SIZE) {
				await flushBatch(batch, putLedgerTransactionBatch)
				persistedCount += DEFAULT_BATCH_SIZE
			}

			if (sourceProcessed % YIELD_EVERY === 0) {
				await yieldToWorkerLoop()
			}
		},
		(processed, total) => {
			reportProgress(onProgress, {
				phase: 'transactions',
				processed,
				total,
				percentage: toPercentage(processed, total),
			})
		}
	)

	const pendingBatchSize = batch.length
	await flushBatch(batch, putLedgerTransactionBatch)
	persistedCount += pendingBatchSize

	reportProgress(onProgress, {
		phase: 'snapshot_write',
		processed: persistedCount,
		total: summary.transactionCount,
		percentage: 99,
	})

	await Promise.all([
		markSnapshotReady(persistedCount),
		setLedgerMeta('syncObjectRows', summary.syncObjectRows),
		setLedgerMeta('sourceProcessedRows', sourceProcessed),
	])

	reportProgress(onProgress, {
		phase: 'complete',
		processed: persistedCount,
		total: persistedCount,
		percentage: 100,
	})

	return {
		transactionCount: persistedCount,
		syncObjectRows: summary.syncObjectRows,
	}
}
