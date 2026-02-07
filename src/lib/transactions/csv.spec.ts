import { describe, it, expect } from 'vitest'

import { isAccountHeaderRow, CsvKey } from './csv'
import type { ParsedCsvRow } from '$lib/csv/models'

describe('isAccountHeaderRow', () => {
	it('should return true for account header row with Name but no Date', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: 'Cash wallet [THB] (W)',
			[CsvKey.Account]: 'THB',
			[CsvKey.Date]: '',
			[CsvKey.Amount]: '',
		}
		expect(isAccountHeaderRow(row)).toBe(true)
	})

	it('should return false for normal transaction row with Date', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: '',
			[CsvKey.Account]: 'Cash wallet [THB] (W)',
			[CsvKey.Date]: '21/12/2025',
			[CsvKey.Amount]: '-310.00',
		}
		expect(isAccountHeaderRow(row)).toBe(false)
	})

	it('should return false when Name is empty', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: '',
			[CsvKey.Account]: 'Cash wallet [THB] (W)',
			[CsvKey.Date]: '',
			[CsvKey.Amount]: '',
		}
		expect(isAccountHeaderRow(row)).toBe(false)
	})

	it('should return false when Name is whitespace only', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: '   ',
			[CsvKey.Account]: 'Cash wallet [THB] (W)',
			[CsvKey.Date]: '',
			[CsvKey.Amount]: '',
		}
		expect(isAccountHeaderRow(row)).toBe(false)
	})

	it('should return true when Date is undefined', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: 'Kbank primary (A)',
			[CsvKey.Account]: 'THB',
		}
		expect(isAccountHeaderRow(row)).toBe(true)
	})
})
