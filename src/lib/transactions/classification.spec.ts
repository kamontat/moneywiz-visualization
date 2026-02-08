import type { ParsedCsvRow } from '$lib/csv/models'
import { describe, it, expect } from 'vitest'

import { CsvKey } from './csv'

const createRow = (
	overrides: Partial<Record<CsvKey, string>> = {}
): ParsedCsvRow => ({
	[CsvKey.Name]: '',
	[CsvKey.Account]: 'Test Account (A)',
	[CsvKey.Transfers]: '',
	[CsvKey.Description]: 'Test Description',
	[CsvKey.Payee]: 'Test Payee',
	[CsvKey.Category]: 'Food > Restaurant',
	[CsvKey.Date]: '01/01/2026',
	[CsvKey.Time]: '12:00',
	[CsvKey.Memo]: '',
	[CsvKey.Amount]: '-100.00',
	[CsvKey.Currency]: 'THB',
	[CsvKey.CheckNumber]: '',
	[CsvKey.Tags]: '',
	...overrides,
})

describe('Transaction Classification', () => {
	describe('Transfer Detection', () => {
		it('should classify as Transfer when Transfers field is populated but no Category', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Transfers]: 'Other Account (A)',
				[CsvKey.Category]: '',
				[CsvKey.Amount]: '-500.00',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Transfer')
			expect('transfer' in result[0] && result[0].transfer.name).toBe(
				'Other Account'
			)
		})

		it('should classify as CategorizedTransfer when Transfers field AND Category are populated', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Transfers]: 'Credit Card (C)',
				[CsvKey.Category]: 'Bills > Credit Card Payment',
				[CsvKey.Amount]: '-5000.00',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('CategorizedTransfer')
			expect('transfer' in result[0] && result[0].transfer.name).toBe(
				'Credit Card'
			)
			expect('category' in result[0] && result[0].category.category).toBe(
				'Bills'
			)
		})
	})

	describe('Income Detection', () => {
		it('should classify as Income when amount > 0 AND category starts with Compensation', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '50000.00',
				[CsvKey.Category]: 'Compensation > Salary',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Income')
		})

		it('should classify as Income when amount > 0 AND category starts with Income', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '100.00',
				[CsvKey.Category]: 'Income > Interest',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Income')
		})
	})

	describe('Expense Detection', () => {
		it('should classify as Expense when amount < 0', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '-150.00',
				[CsvKey.Category]: 'Food > Restaurant',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Expense')
		})
	})

	describe('Refund Detection', () => {
		it('should classify as Refund when amount > 0 AND category is NOT income category', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '50.00',
				[CsvKey.Category]: 'Food > Restaurant',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Refund')
		})

		it('should classify as Refund for returned merchandise', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '299.00',
				[CsvKey.Category]: 'Shopping > Electronics',
				[CsvKey.Description]: 'Return - Broken headphones',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Refund')
		})
	})
})
