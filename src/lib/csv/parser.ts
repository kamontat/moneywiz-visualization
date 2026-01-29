import { csv } from '$lib/loggers'
import { CsvParseError } from './errors'
import type { ParsedCsv, ParsedCsvRow } from './model'
import { tokenize } from './utils'

const log = csv.extends('parser')

export const parseCsvFile = async (file: File): Promise<ParsedCsv> => {
	log.debug('starting to parse CSV file: %s', file.name)

	if (file.size === 0) {
		log.error('File is empty')
		throw new CsvParseError('File is empty')
	}

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

	const lines = rawLines.slice(startIndex).filter((line) => line.trim().length > 0)
	log.debug('filtered to %d non-empty lines (starting at index %d)', lines.length, startIndex)

	if (lines.length === 0) {
		log.error('No data lines found')
		throw new CsvParseError('CSV contains no data')
	}

	const headers = tokenize(lines[0], delimiter).map(
		(header, index) => header || `field-${index + 1}`
	)

	const rows = lines.slice(1).map((line) => {
		const cells = tokenize(line, delimiter)
		const row: ParsedCsvRow = {}

		headers.forEach((header, index) => {
			row[header] = cells[index] ?? ''
		})

		return row
	})

	log.debug('parsed %d headers, %d rows', headers.length, rows.length)
	return { headers, rows }
}
