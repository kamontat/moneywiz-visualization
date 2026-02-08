import type { ParsedCsvRow } from '$lib/csv/models'
import { transaction } from '$lib/loggers'

export enum CsvKey {
	Name = 'Name',
	CurrentBalance = 'Current balance',
	Account = 'Account',
	Transfers = 'Transfers',
	Description = 'Description',
	Payee = 'Payee',
	Category = 'Category',
	Date = 'Date',
	Time = 'Time',
	Memo = 'Memo',
	Amount = 'Amount',
	Currency = 'Currency',
	CheckNumber = 'Check #',
	Tags = 'Tags',
}

/**
 * Checks if a CSV row is an account header/summary row.
 * MoneyWiz CSV exports include account summary rows with format:
 * "AccountName","Balance","Currency","","","","","","","","","","","",""
 * These have the Name column AND Current balance column filled.
 */
export const isAccountHeaderRow = (row: ParsedCsvRow): boolean => {
	const name = row[CsvKey.Name]
	const currentBalance = row[CsvKey.CurrentBalance]
	return Boolean(
		name && name.trim() !== '' && currentBalance && currentBalance.trim() !== ''
	)
}

export const getValue = (row: ParsedCsvRow, key: CsvKey): string => {
	const log = transaction.extends('getValue')
	const val = row[key]
	if (val === undefined || val === null) {
		log.warn('key "%s" not found in row: %o', key, row)
		return ''
	}
	return val
}
