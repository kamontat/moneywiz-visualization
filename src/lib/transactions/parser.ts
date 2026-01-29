import { type ParsedCsv } from '$lib/csv'
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
		const account = parseAccount(row['Account'] ?? '')
		const amount = parseAmount(row['Amount'] ?? '', row['Currency'])
		const date = parseDate(row['Date'] ?? '', row['Time'])
		const description = row['Description'] ?? ''
		const memo = row['Memo'] ?? ''
		const tags = parseTag(row['Tags'] ?? '')

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
		if (row['Transfers']) {
			return {
				...base,
				type: 'Transfer',
				transfer: parseAccount(row['Transfers']),
			} as ParsedTransferTransaction
		}

		const payee = row['Payee'] ?? ''
		const category = row['Category'] ? parseCategory(row['Category']) : null
		const checkNumber = row['Check #'] ?? ''

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
