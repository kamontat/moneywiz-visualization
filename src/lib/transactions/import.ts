import type { ParseError } from 'papaparse'
import type { ParsedTransaction } from './models'
import type { ParsedCsvRow } from '$lib/csv/models'
import papaparse from 'papaparse'

import { parseCsvRowToTransaction } from './classifier'
import { isAccountHeaderRow } from './csv'

import { transaction } from '$lib/loggers'
import { indexDBV1, STATE_TRX_V1 } from '$utils/stores'

const log = transaction.extends('import')

export interface ImportProgress {
	phase: 'parsing' | 'importing' | 'complete' | 'error'
	processed: number
	total: number
	percentage: number
	error?: Error
}

export interface ImportOptions {
	batchSize?: number
	onProgress?: (progress: ImportProgress) => void
}

const DEFAULT_BATCH_SIZE = 2000
const DEFAULT_DELIMITER = ','
const MAX_PROGRESS_PERCENTAGE = 99
const PREAMBLE_READ_SIZE = 32 * 1024

const toError = (error: unknown): Error => {
	if (error instanceof Error) return error
	return new Error(String(error))
}

const removeBom = (text: string): string => text.replace(/^\uFEFF/, '')

const rowHasData = (row: ParsedCsvRow): boolean =>
	Object.values(row).some((value) => String(value ?? '').trim() !== '')

const toParseError = (errors: ParseError[]): Error =>
	new Error(`CSV contains ${errors.length} errors`)

const insertBatch = async (
	transactions: ParsedTransaction[]
): Promise<void> => {
	const trx = await indexDBV1.transaction(STATE_TRX_V1, 'readwrite')
	for (const t of transactions) {
		trx.store.put(t)
	}
	await trx.done
}

export const detectCsvDelimiter = async (file: File): Promise<string> => {
	const prefix = removeBom(await file.slice(0, PREAMBLE_READ_SIZE).text())
	const rawLines = prefix.split(/\r?\n/)

	let startIndex = 0
	while (startIndex < rawLines.length && rawLines[startIndex].trim() === '') {
		startIndex += 1
	}

	const firstLine = rawLines[startIndex]?.trim()
	if (firstLine?.toLowerCase().startsWith('sep=')) {
		return firstLine.slice(4, 5) || DEFAULT_DELIMITER
	}
	return DEFAULT_DELIMITER
}

export const stripCsvPreamble = (chunk: string): string => {
	const rawLines = removeBom(chunk).split(/\r?\n/)
	let startIndex = 0

	while (startIndex < rawLines.length && rawLines[startIndex].trim() === '') {
		startIndex += 1
	}

	if (rawLines[startIndex]?.trim().toLowerCase().startsWith('sep=')) {
		startIndex += 1
	}

	return rawLines.slice(startIndex).join('\n')
}

const toProgressPercentage = (cursor: number, totalBytes: number): number => {
	if (totalBytes <= 0) return 0
	return Math.min(
		MAX_PROGRESS_PERCENTAGE,
		Math.round((cursor / totalBytes) * 100)
	)
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

	const delimiter = await detectCsvDelimiter(file)
	const normalizedBatchSize = Math.max(1, batchSize)

	log.debug(
		'starting import: %s (size=%d, delimiter=%s)',
		file.name,
		file.size,
		delimiter
	)

	onProgress?.({
		phase: 'parsing',
		processed: 0,
		total: 0,
		percentage: 0,
	})

	let scannedRows = 0
	let processedRows = 0
	let batch: ParsedTransaction[] = []
	let failed = false
	const totalBytes = file.size

	const flushBatch = async () => {
		if (batch.length === 0) return

		const pending = batch
		batch = []
		await insertBatch(pending)
		processedRows += pending.length

		// Yield between chunk writes to keep UI responsive during large imports.
		await new Promise((resolve) => setTimeout(resolve, 0))
	}

	await new Promise<void>((resolve, reject) => {
		const fail = (error: unknown) => {
			if (failed) return
			failed = true
			const parsedError = toError(error)

			onProgress?.({
				phase: 'error',
				processed: processedRows,
				total: Math.max(scannedRows, processedRows),
				percentage: 0,
				error: parsedError,
			})

			reject(parsedError)
		}

		papaparse.parse<ParsedCsvRow>(file, {
			delimiter,
			header: true,
			skipEmptyLines: true,
			beforeFirstChunk: stripCsvPreamble,
			chunk: (results, parser) => {
				parser.pause()

				void (async () => {
					if (results.errors.length > 0) {
						throw toParseError(results.errors)
					}

					for (const row of results.data) {
						if (!row || !rowHasData(row)) continue
						scannedRows += 1

						if (isAccountHeaderRow(row)) continue

						const trx = parseCsvRowToTransaction(row)
						batch.push(trx)

						if (batch.length >= normalizedBatchSize) {
							await flushBatch()
						}
					}

					onProgress?.({
						phase: 'importing',
						processed: processedRows,
						total: Math.max(scannedRows, processedRows),
						percentage: toProgressPercentage(
							results.meta.cursor ?? 0,
							totalBytes
						),
					})

					parser.resume()
				})().catch((error) => {
					parser.abort()
					fail(error)
				})
			},
			complete: () => {
				if (failed) return
				void (async () => {
					await flushBatch()

					onProgress?.({
						phase: 'complete',
						processed: processedRows,
						total: Math.max(scannedRows, processedRows),
						percentage: 100,
					})

					resolve()
				})().catch((error) => fail(error))
			},
			error: (error) => fail(error),
		})
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
