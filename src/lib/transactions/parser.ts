import { getValue, type ParsedCsv } from '$lib/csv'
import type {
	ParsedBaseTransaction,
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedTransaction,
	ParsedTransferTransaction,
} from './models'
import { parseAccount, parseAmount, parseCategory, parseDate, parseTag } from './utils'

import { parseCsvFile } from '$lib/csv'
import { transaction } from '$lib/loggers'

const log = transaction.extends('parser')

export const parseTransactionsFile = async (file: File): Promise<ParsedTransaction[]> => {
	log.debug('parsing transactions from file: %s', file.name)
	const csv = await parseCsvFile(file)
	return parseTransactions(csv)
}

export const parseTransactions = (csv: ParsedCsv): ParsedTransaction[] => {
	log.debug('parsing %d rows from CSV', csv.rows.length)

	return csv.rows.map((row) => {
		const account = parseAccount(getValue(row, 'Account'))
		const amount = parseAmount(getValue(row, 'Amount'), getValue(row, 'Currency'))
		const date = parseDate(getValue(row, 'Date'), getValue(row, 'Time'))
		const description = getValue(row, 'Description')
		const memo = getValue(row, 'Memo')
		const tags = parseTag(getValue(row, 'Tags'))
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
		const transfer = getValue(row, 'Transfer')
		if (transfer) {
			return {
				...base,
				type: 'Transfer',
				transfer: parseAccount(transfer),
			} as ParsedTransferTransaction
		}

		const payee = getValue(row, 'Payee')
		const category = parseCategory(getValue(row, 'Category'))
		const checkNumber = getValue(row, 'Check #')

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
}
