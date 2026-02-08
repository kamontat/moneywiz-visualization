import type {
	ParsedBaseTransaction,
	ParsedCategorizedTransferTransaction,
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedTransaction,
	ParsedTransferTransaction,
} from './models'
import type { ParsedCsv, ParsedCsvRow } from '$lib/csv/models'
import { CsvKey, getValue } from './csv'
import {
	isIncomeCategory,
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
): Promise<ParsedTransaction[]> => {
	log.debug('parsing transactions from file: %s', file.name)
	const csv = await parseCsvFile(file)
	return parseTransactions(csv)
}

export const parseTransactions = (csv: ParsedCsv): ParsedTransaction[] => {
	log.debug('parsing %d rows from CSV', csv.rows.length)

	const data = csv.rows.map((row: ParsedCsvRow) => {
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

		const transferField = getValue(row, CsvKey.Transfers)
		const categoryField = getValue(row, CsvKey.Category)
		const payee = getValue(row, CsvKey.Payee)
		const category = parseCategory(categoryField)
		const checkNumber = getValue(row, CsvKey.CheckNumber)

		if (transferField) {
			const hasCategory = categoryField && categoryField.trim() !== ''
			if (hasCategory) {
				return {
					...base,
					type: 'CategorizedTransfer',
					transfer: parseAccount(transferField),
					payee,
					category,
					checkNumber,
				} as ParsedCategorizedTransferTransaction
			}
			return {
				...base,
				type: 'Transfer',
				transfer: parseAccount(transferField),
			} as ParsedTransferTransaction
		}

		if (amount.value > 0 && isIncomeCategory(category)) {
			return {
				...base,
				type: 'Income',
				payee,
				category,
				checkNumber,
			} as ParsedIncomeTransaction
		}

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
			type: 'Refund',
			payee,
			category,
			checkNumber,
		} as ParsedRefundTransaction
	})

	return data
}
