import type { ParsedTransaction } from './models'
import type {
	ParsedBaseTransaction,
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedTransferTransaction,
} from './models/transaction'
import type { ParsedCsvRow } from '$lib/csv/models'
import papaparse from 'papaparse'

import { CsvKey, getValue } from './csv'
import {
	parseAccount,
	parseAmount,
	parseCategory,
	parseDate,
	parseTag,
} from './utils'

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

const parseRowToTransaction = (row: ParsedCsvRow): ParsedTransaction => {
	const account = parseAccount(getValue(row, CsvKey.Account))
	const amount = parseAmount(
		getValue(row, CsvKey.Amount),
		getValue(row, CsvKey.Currency)
	)
	const date = parseDate(getValue(row, CsvKey.Date), getValue(row, CsvKey.Time))
	const description = getValue(row, CsvKey.Description)
	const memo = getValue(row, CsvKey.Memo)
	const tags = parseTag(getValue(row, CsvKey.Tags))

	const base: ParsedBaseTransaction = {
		account,
		amount,
		date,
		description,
		memo,
		tags,
		raw: row,
	}

	const transfer = getValue(row, CsvKey.Transfers)
	if (transfer) {
		return {
			...base,
			type: 'Transfer',
			transfer: parseAccount(transfer),
		} as ParsedTransferTransaction
	}

	const payee = getValue(row, CsvKey.Payee)
	const category = parseCategory(getValue(row, CsvKey.Category))
	const checkNumber = getValue(row, CsvKey.CheckNumber)

	if (amount.value < 0) {
		return {
			...base,
			type: 'Expense',
			payee,
			category,
			checkNumber,
		} as ParsedExpenseTransaction
	}

	return {
		...base,
		type: 'Income',
		payee,
		category,
		checkNumber,
	} as ParsedIncomeTransaction
}

const insertBatch = async (
	transactions: ParsedTransaction[]
): Promise<void> => {
	const trx = await indexDBV1.transaction(STATE_TRX_V1, 'readwrite')
	for (const t of transactions) {
		trx.store.put(t)
	}
	await trx.done
}

interface CsvPreprocess {
	delimiter: string
	content: string
}

const preprocessCsv = async (file: File): Promise<CsvPreprocess> => {
	const text = await file.text()
	// Remove BOM if present
	const rawLines = text.replace(/^\uFEFF/, '').split(/\r?\n/)

	let startIndex = 0
	let delimiter = ','

	// Skip leading empty lines
	while (startIndex < rawLines.length && rawLines[startIndex].trim() === '') {
		startIndex += 1
	}

	// MoneyWiz exports include a "sep=," (or similar) preamble; detect and honor it
	const firstLine = rawLines[startIndex]?.trim()
	if (firstLine?.toLowerCase().startsWith('sep=')) {
		delimiter = firstLine.slice(4, 5) || delimiter
		log.debug('detected separator preamble: delimiter=%s', delimiter)
		startIndex += 1
	}

	// Join remaining lines, filtering empty ones
	const content = rawLines
		.slice(startIndex)
		.filter((line) => line.trim().length > 0)
		.join('\n')

	return { delimiter, content }
}

export const importTransactionsFromFile = async (
	file: File,
	options: ImportOptions = {}
): Promise<number> => {
	const { batchSize = DEFAULT_BATCH_SIZE, onProgress } = options
	const { delimiter, content } = await preprocessCsv(file)

	log.debug(
		'starting import: %s (size=%d, delimiter=%s)',
		file.name,
		file.size,
		delimiter
	)

	const allRows: ParsedCsvRow[] = []

	await new Promise<void>((resolve, reject) => {
		papaparse.parse<ParsedCsvRow>(content, {
			delimiter,
			skipEmptyLines: true,
			header: true,
			chunk: (results: papaparse.ParseResult<ParsedCsvRow>) => {
				for (const row of results.data) {
					if (row && Object.keys(row).length > 0) {
						allRows.push(row)
					}
				}

				onProgress?.({
					phase: 'parsing',
					processed: 0,
					total: allRows.length,
					percentage: 0,
				})
			},
			complete: () => resolve(),
			error: (error: Error) => reject(error),
		})
	})

	log.debug('parsed %d rows, starting import', allRows.length)

	const total = allRows.length
	let processed = 0
	let batch: ParsedTransaction[] = []

	for (let i = 0; i < allRows.length; i++) {
		const row = allRows[i]
		const trx = parseRowToTransaction(row)
		batch.push(trx)

		if (batch.length >= batchSize) {
			await insertBatch(batch)
			processed += batch.length
			batch = []

			onProgress?.({
				phase: 'importing',
				processed,
				total,
				percentage: Math.round((processed / total) * 100),
			})

			await new Promise((r) => setTimeout(r, 0))
		}
	}

	if (batch.length > 0) {
		await insertBatch(batch)
		processed += batch.length
	}

	onProgress?.({
		phase: 'complete',
		processed,
		total,
		percentage: 100,
	})

	log.debug('import complete: %d transactions', processed)
	return processed
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
