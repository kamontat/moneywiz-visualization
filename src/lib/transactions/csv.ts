import type { ParsedCsvRow } from '$lib/csv'
import { transaction } from '$lib/loggers'

export enum CsvKey {
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

export const getValue = (row: ParsedCsvRow, key: CsvKey): string => {
	const log = transaction.extends('getValue')
	const val = row[key]
	if (val === undefined || val === null) {
		log.warn('key "%s" not found in row: %o', key, row)
		return ''
	}
	return val
}
