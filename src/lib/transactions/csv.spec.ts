import type { ParsedCsvRow } from '$lib/csv/models'
import { describe, it, expect } from 'vitest'

import { isAccountHeaderRow, CsvKey } from './csv'

describe('isAccountHeaderRow', () => {
	it('should return true for account header row with Name and Current balance', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: 'Cash wallet [THB] (W)',
			[CsvKey.CurrentBalance]: '1,380.00',
			[CsvKey.Account]: 'THB',
			[CsvKey.Date]: '',
			[CsvKey.Amount]: '',
		}
		expect(isAccountHeaderRow(row)).toBe(true)
	})

	it('should return false for normal transaction row without Name', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: '',
			[CsvKey.CurrentBalance]: '',
			[CsvKey.Account]: 'Cash wallet [THB] (W)',
			[CsvKey.Date]: '21/12/2025',
			[CsvKey.Amount]: '-310.00',
		}
		expect(isAccountHeaderRow(row)).toBe(false)
	})

	it('should return false when Name is empty', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: '',
			[CsvKey.CurrentBalance]: '1,380.00',
			[CsvKey.Account]: 'Cash wallet [THB] (W)',
			[CsvKey.Date]: '',
			[CsvKey.Amount]: '',
		}
		expect(isAccountHeaderRow(row)).toBe(false)
	})

	it('should return false when Name is whitespace only', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: '   ',
			[CsvKey.CurrentBalance]: '1,380.00',
			[CsvKey.Account]: 'Cash wallet [THB] (W)',
			[CsvKey.Date]: '',
			[CsvKey.Amount]: '',
		}
		expect(isAccountHeaderRow(row)).toBe(false)
	})

	it('should return false when Current balance is empty', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: 'Kbank primary (A)',
			[CsvKey.CurrentBalance]: '',
			[CsvKey.Account]: 'THB',
		}
		expect(isAccountHeaderRow(row)).toBe(false)
	})

	it('should return false when Current balance is undefined', () => {
		const row: ParsedCsvRow = {
			[CsvKey.Name]: 'Kbank primary (A)',
			[CsvKey.Account]: 'THB',
		}
		expect(isAccountHeaderRow(row)).toBe(false)
	})
})
