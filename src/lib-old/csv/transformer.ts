/**
 * CSV transformation logic for MoneyWiz reports
 */

import type {
	AccountType,
	MoneyWizTransaction,
	ParsedAccount,
	ParsedCategory,
	ParsedTag,
} from '../types'
import { parseCsvFile } from './parser'
import type { CsvRow } from './types'

/**
 * Parse a MoneyWiz CSV report file into structured transaction objects.
 */
export async function parseMoneyWizReport(file: File): Promise<MoneyWizTransaction[]> {
	const { rows } = await parseCsvFile(file)
	return rows.map(transformRow)
}

// --- Field Parsers ---

export function parseCategory(raw: string): ParsedCategory | null {
	if (!raw) return null
	const parts = raw.split('>').map((s) => s.trim())
	return {
		root: parts[0] || '',
		sub: parts[1] || '',
	}
}

export function parseTags(raw: string): ParsedTag[] {
	if (!raw) return []
	return raw
		.split(';')
		.map((t) => t.trim())
		.filter((t) => t.length > 0)
		.map((t) => {
			const parts = t.split(':')
			if (parts.length > 1) {
				return { group: parts[0].trim(), name: parts[1].trim() }
			}
			return { group: '', name: parts[0].trim() }
		})
}

export function parseDate(dateStr: string, timeStr: string): Date {
	const [day, month, year] = (dateStr || '').split('/').map(Number)
	const [hour, minute] = (timeStr || '00:00').split(':').map(Number)
	// Month is 0-indexed in JS Date
	if (!day || !month || !year) return new Date(NaN)
	return new Date(year, month - 1, day, hour || 0, minute || 0)
}

export function parseAccount(raw: string): ParsedAccount {
	if (!raw) return { name: '', extra: '', type: 'Unknown' }

	const match = raw.match(/^(.*)\s\((.*)\)$/)
	if (match) {
		const nameAndExtra = match[1].trim()
		const typeStr = match[2]

		const validTypes: AccountType[] = ['A', 'C', 'D', 'L', 'I', 'CT']

		return {
			name: nameAndExtra,
			extra: '',
			type: validTypes.includes(typeStr as AccountType) ? (typeStr as AccountType) : 'Unknown',
		}
	}

	return { name: raw, extra: '', type: 'Unknown' }
}

export function parseAmount(raw: string): number {
	if (!raw) return 0
	// Remove commas and parse
	return parseFloat(raw.replace(/,/g, ''))
}

export function transformRow(row: CsvRow): MoneyWizTransaction {
	return {
		account: parseAccount(row['Account']),
		transfers: row['Transfers'] ? parseAccount(row['Transfers']) : null,
		description: row['Description'] || '',
		payee: row['Payee'] || '',
		category: parseCategory(row['Category']),
		date: parseDate(row['Date'], row['Time']),
		memo: row['Memo'] || '',
		amount: parseAmount(row['Amount']),
		currency: row['Currency'] || '',
		checkNumber: row['Check #'] || '',
		tags: parseTags(row['Tags']),
		// @ts-expect-error - CsvRow is compatible with Record<string, string> but TS might complain
		raw: row,
	}
}
