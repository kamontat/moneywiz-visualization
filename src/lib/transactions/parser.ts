import type {
	ParsedBaseTransaction,
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedTransactions,
	ParsedTransferTransaction,
} from './models'
import type { ParsedCsv } from '$lib/csv'
import { CsvKey, getValue } from './csv'
import {
	parseAccount,
	parseAmount,
	parseCategory,
	parseDate,
	parseTag,
} from './utils'

import { parseCsvFile } from '$lib/csv'
import { transaction } from '$lib/loggers'

const log = transaction.extends('parser')

export const parseTransactionsFile = async (
	file: File
): Promise<ParsedTransactions> => {
	log.debug('parsing transactions from file: %s', file.name)
	const csv = await parseCsvFile(file)
	return parseTransactions(csv)
}

export const parseTransactions = (csv: ParsedCsv): ParsedTransactions => {
	log.debug('parsing %d rows from CSV', csv.rows.length)

	const data = csv.rows.map((row) => {
		const account = parseAccount(getValue(row, CsvKey.Account))
		const amount = parseAmount(
			getValue(row, CsvKey.Amount),
			getValue(row, CsvKey.Currency)
		)
		const date = parseDate(
			getValue(row, CsvKey.Date),
			getValue(row, CsvKey.Time)
		)
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

		// Check for Transfer
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

		// Check for Expense (negative amount) vs Income (positive amount)
		if (amount.value < 0) {
			return {
				...base,
				type: 'Expense',
				payee,
				category,
				checkNumber,
			} as ParsedExpenseTransaction
		}

		// Default to Income
		return {
			...base,
			type: 'Income',
			payee,
			category,
			checkNumber,
		} as ParsedIncomeTransaction
	})

	return { fileName: csv.fileName, data }
}
