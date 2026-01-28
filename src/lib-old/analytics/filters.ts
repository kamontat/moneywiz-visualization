/**
 * Filtering logic for financial data
 */

import type { ParsedCsv } from '../csv'
import { log } from '../debug'
import { parseDateDDMMYYYY } from '../finance'
import { parseTagsFromField } from './tags'

export interface TagFilter {
	category: string
	values: string[]
	mode: 'include' | 'exclude'
}

/**
 * Filter rows to only THB currency transactions
 */
export function getTHBRows(data: ParsedCsv | null): Record<string, string>[] {
	if (!data) {
		log.pageDashboard('getTHBRows: no data')
		return []
	}
	const rows = data.rows.filter((r) => (r['Currency'] || '').toUpperCase() === 'THB')
	log.pageDashboard('getTHBRows: filtered %d THB rows from %d total', rows.length, data.rows.length)
	return rows
}

/**
 * Get the date range (min and max date) from transactions
 */
export function getDateRange(thbRows: Record<string, string>[]): { start: Date; end: Date } | null {
	const dates = thbRows
		.map((r) => parseDateDDMMYYYY(r['Date'] || ''))
		.filter((d): d is Date => d instanceof Date)

	if (dates.length === 0) return null

	const start = new Date(Math.min(...dates.map((d) => d.getTime())))
	const end = new Date(Math.max(...dates.map((d) => d.getTime())))

	return { start, end }
}

/**
 * Filter rows by date range (inclusive)
 * @param rows The parsed CSV rows
 * @param start Start date (null = no start limit)
 * @param end End date (null = no end limit)
 */
export function filterByDateRange(
	rows: Record<string, string>[],
	start: Date | null,
	end: Date | null
): Record<string, string>[] {
	if (!start && !end) return rows

	return rows.filter((row) => {
		const dateStr = row['Date']
		if (!dateStr) return false

		const date = parseDateDDMMYYYY(dateStr)
		if (!date) return false

		// Normalize times to start of day for accurate comparison
		if (start && date < start) return false
		if (end && date > end) return false

		return true
	})
}

/**
 * Filter rows by tag filters.
 * Multiple filters combine with AND logic (row must pass all filters).
 */
export function filterByTags(
	rows: Record<string, string>[],
	filters: TagFilter[]
): Record<string, string>[] {
	if (!filters || filters.length === 0) return rows

	return rows.filter((row) => {
		const rowTags = parseTagsFromField(row['Tags'] || '')

		for (const filter of filters) {
			const { category, values, mode } = filter
			if (values.length === 0) continue // No values selected = no filter for this category

			const rowTagValue = rowTags[category]

			if (mode === 'include') {
				// Must have the tag category AND value must be in selected values
				if (!rowTagValue) return false
				if (!values.includes(rowTagValue)) return false
			} else if (mode === 'exclude') {
				// If row has the tag category AND value is in selected values, reject it
				if (rowTagValue && values.includes(rowTagValue)) return false
			}
		}

		return true
	})
}
