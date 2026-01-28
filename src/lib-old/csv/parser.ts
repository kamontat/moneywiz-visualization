/**
 * CSV parsing logic
 */

import { log } from '../debug'
import { CsvParseError, type CsvRow, type ParsedCsv } from './types'

/**
 * Parse a CSV file into headers and row objects. Basic quoting is supported (double quotes, escaped by doubling).
 * @throws {CsvParseError} When the file is empty or contains no valid data
 */
export async function parseCsvFile(file: File): Promise<ParsedCsv> {
	log.csv('parsing file: %s (%d bytes)', file.name, file.size)

	if (file.size === 0) {
		log.csv('error: file is empty')
		throw new CsvParseError('File is empty')
	}

	const content = await file.text()
	const result = parseCsv(content)
	log.csv('file parsed: %d headers, %d rows', result.headers.length, result.rows.length)
	return result
}

export function parseCsv(text: string): ParsedCsv {
	log.csv('parsing text: %d characters', text.length)
	const cleaned = text.replace(/^\uFEFF/, '')
	const rawLines = cleaned.split(/\r?\n/).map((line) => line.trimEnd())
	log.csv('split into %d raw lines', rawLines.length)

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
		log.csv('detected separator preamble: delimiter=%s', delimiter)
		startIndex += 1
	}

	const lines = rawLines.slice(startIndex).filter((line) => line.trim().length > 0)
	log.csv('filtered to %d non-empty lines (starting at index %d)', lines.length, startIndex)

	if (lines.length === 0) {
		log.csv('error: no data lines found')
		throw new CsvParseError('CSV contains no data')
	}

	const headers = tokenize(lines[0], delimiter).map(
		(header, index) => header || `field${index + 1}`
	)

	if (headers.length === 0) {
		log.csv('error: no headers found')
		throw new CsvParseError('CSV contains no headers')
	}

	const rows = lines.slice(1).map((line) => {
		const cells = tokenize(line, delimiter)
		const entry: CsvRow = {}

		headers.forEach((header, index) => {
			entry[header] = cells[index] ?? ''
		})

		return entry
	})

	log.csv('parsed: %d headers, %d rows', headers.length, rows.length)
	return { headers, rows }
}

export function tokenize(line: string, delimiter = ','): string[] {
	const values: string[] = []
	let current = ''
	let inQuotes = false

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index]
		const next = line[index + 1]

		if (character === '"') {
			if (inQuotes && next === '"') {
				current += '"'
				index += 1
				continue
			}

			inQuotes = !inQuotes
			continue
		}

		if (character === delimiter && !inQuotes) {
			values.push(current.trim())
			current = ''
			continue
		}

		current += character
	}

	values.push(current.trim())
	return values
}
