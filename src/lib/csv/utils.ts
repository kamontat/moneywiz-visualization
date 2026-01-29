import { csv } from '$lib/loggers'
import type { ParsedCsvRow } from './model'

export const getValue = (row: ParsedCsvRow, key: string): string => {
	const log = csv.extends('getValue')
	const val = row[key]
	if (val === undefined || val === null) {
		log.warn('key "%s" not found in row: %o', key, row)
		return ''
	}
	return val
}

export function tokenize(line: string, delimiter = ','): string[] {
	const values: string[] = []
	let current = ''
	let inQuotes = false

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index]

		if (character === '"') {
			inQuotes = !inQuotes
			current += character
			continue
		}

		if (character === delimiter && !inQuotes) {
			values.push(processValue(current))
			current = ''
			continue
		}

		current += character
	}

	values.push(processValue(current))
	return values
}

function processValue(value: string): string {
	const trimmed = value.trim()
	// Check if it's a valid quoted value: starts and ends with " and has content
	if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
		const content = trimmed.slice(1, -1)
		return content.replace(/""/g, '"')
	}
	return trimmed
}
