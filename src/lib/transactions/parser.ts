import { type ParsedCsv } from '$lib/csv'
import type { ParsedTransaction } from './models'

import { transaction } from '$lib/loggers'
import { parseCsvFile } from '$lib/csv'

const log = transaction.extends('parser')

export const parseTransactionsFile = async (file: File): Promise<ParsedTransaction[]> => {
	log.debug('parsing transactions from file: %s', file.name)
	const csv = await parseCsvFile(file)
	return parseTransactions(csv)
}

export const parseTransactions = (csv: ParsedCsv): ParsedTransaction[] => {
	log.debug('parsing %d rows from CSV', csv.rows.length)
	// TODO: implement this function
	return [] as ParsedTransaction[]
}
