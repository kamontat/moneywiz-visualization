import type { ParsedCsv, ParsedCsvRow } from './models'
import papaparse from 'papaparse'

import { CsvParseError } from './errors'

import { csv } from '$lib/loggers'

const log = csv.extends('parser')

const { parse } = papaparse
export const parseCsvFile = async (file: File): Promise<ParsedCsv> => {
	log.debug('starting to parse CSV file: %s', file.name)

	if (file.size === 0) {
		log.error('File is empty')
		throw new CsvParseError('File is empty')
	}

	// TODO: support large files via streaming
	const text = await file.text()
	return parseCsv(text)
}

export const parseCsv = (text: string): ParsedCsv => {
	log.debug('starting to parse CSV text: %d characters', text.length)

	const rawLines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
	log.debug('split into %d raw lines', rawLines.length)

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

	const lines = rawLines
		.slice(startIndex)
		.filter((line) => line.trim().length > 0)
	log.debug(
		'filtered to %d non-empty lines (starting at index %d)',
		lines.length,
		startIndex
	)

	if (lines.length === 0) {
		log.error('No data lines found')
		throw new CsvParseError('CSV contains no data')
	}

	const csv = parse(lines.join('\n'), {
		delimiter,
		skipEmptyLines: true,
		header: true,
	})

	if (csv.errors.length > 0) {
		log.error('Parse errors: %O', csv.errors)
		throw new CsvParseError(`CSV contains ${csv.errors.length} errors`)
	}

	const headers = csv.meta.fields ?? []
	const rows = csv.data.map((raw) => {
		const row: ParsedCsvRow = {}
		headers.forEach((header) => {
			row[header] = (raw as Record<string, string>)[header] ?? ''
		})
		return row
	})

	log.debug('parsed %d headers, %d rows', headers.length, rows.length)
	return { headers, rows }
}
