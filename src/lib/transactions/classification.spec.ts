import type { ParsedCsvRow } from '$lib/csv/models'
import { describe, it, expect } from 'vitest'

import { parseCsvRowToTransaction } from './classifier'
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
		it('should classify as Transfer when Transfers field is populated but no Category', () => {
			const row = createRow({
				[CsvKey.Transfers]: 'Other Account (A)',
				[CsvKey.Category]: '',
				[CsvKey.Amount]: '-500.00',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Transfer')
			expect('transfer' in result && result.transfer.name).toBe('Other Account')
		})

		it('should classify as Expense when Transfers field AND Category are populated', () => {
			const row = createRow({
				[CsvKey.Transfers]: 'Credit Card (C)',
				[CsvKey.Category]: 'Bills > Credit Card Payment',
				[CsvKey.Amount]: '-5000.00',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Expense')
			expect('payee' in result && result.payee).toBe('Credit Card')
			expect('category' in result && result.category.category).toBe('Bills')
		})
	})

	describe('New Balance Detection', () => {
		it('should classify as NewBalance when category is empty and description is new balance', () => {
			const row = createRow({
				[CsvKey.Category]: '',
				[CsvKey.Description]: 'New Balance',
				[CsvKey.Amount]: '1200.00',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('NewBalance')
		})

		it('should classify as NewBalance with case-insensitive description', () => {
			const row = createRow({
				[CsvKey.Category]: '',
				[CsvKey.Description]: '  new balance  ',
				[CsvKey.Amount]: '-50.00',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('NewBalance')
		})

		it('should not classify as NewBalance when category exists', () => {
			const row = createRow({
				[CsvKey.Category]: 'Food > Restaurant',
				[CsvKey.Description]: 'New Balance',
				[CsvKey.Amount]: '-50.00',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Expense')
		})
	})

	describe('Investment Buy/Sell Detection', () => {
		it('should classify as Sell when investment account has no category and amount > 0', () => {
			const row = createRow({
				[CsvKey.Account]: 'Broker Account (I)',
				[CsvKey.Category]: '',
				[CsvKey.Amount]: '1500.00',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Sell')
		})

		it('should classify as Buy when investment account has no category and amount < 0', () => {
			const row = createRow({
				[CsvKey.Account]: 'Broker Account (I)',
				[CsvKey.Category]: '',
				[CsvKey.Amount]: '-1500.00',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Buy')
		})
	})

	describe('Income Detection', () => {
		it('should classify as Income when amount > 0 AND category starts with Compensation', () => {
			const row = createRow({
				[CsvKey.Amount]: '50000.00',
				[CsvKey.Category]: 'Compensation > Salary',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Income')
		})

		it('should classify as Income when amount > 0 AND category is Other Incomes > Interest', () => {
			const row = createRow({
				[CsvKey.Amount]: '100.00',
				[CsvKey.Category]: 'Other Incomes > Interest',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Income')
		})
	})

	describe('Expense Detection', () => {
		it('should classify as Expense when amount < 0', () => {
			const row = createRow({
				[CsvKey.Amount]: '-150.00',
				[CsvKey.Category]: 'Food > Restaurant',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Expense')
		})
	})

	describe('Refund Detection', () => {
		it('should classify as Refund when amount > 0 AND category is NOT income category', () => {
			const row = createRow({
				[CsvKey.Amount]: '50.00',
				[CsvKey.Category]: 'Food > Restaurant',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Refund')
		})

		it('should classify as Refund for returned merchandise', () => {
			const row = createRow({
				[CsvKey.Amount]: '299.00',
				[CsvKey.Category]: 'Shopping > Electronics',
				[CsvKey.Description]: 'Return - Broken headphones',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Refund')
		})
	})

	describe('Unknown Detection', () => {
		it('should classify as Unknown when amount > 0 and category is empty', () => {
			const row = createRow({
				[CsvKey.Amount]: '50.00',
				[CsvKey.Category]: '',
				[CsvKey.Description]: 'Balance adjustment',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Unknown')
		})

		it('should classify as Unknown when amount is zero and category is empty', () => {
			const row = createRow({
				[CsvKey.Amount]: '0.00',
				[CsvKey.Category]: '',
				[CsvKey.Description]: 'Zero balance line',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Unknown')
		})

		it('should classify as Unknown when amount is zero and category is income category', () => {
			const row = createRow({
				[CsvKey.Amount]: '0.00',
				[CsvKey.Category]: 'Compensation > Salary',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Unknown')
		})

		it('should classify transfer with zero amount and income category as Unknown', () => {
			const row = createRow({
				[CsvKey.Transfers]: 'Other Account (A)',
				[CsvKey.Amount]: '0.00',
				[CsvKey.Category]: 'Compensation > Salary',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Unknown')
		})
	})

	describe('Special Category Detection', () => {
		it('should classify as Debt when category is Other Expenses > Debt', () => {
			const row = createRow({
				[CsvKey.Amount]: '-1000.00',
				[CsvKey.Category]: 'Other Expenses > Debt',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Debt')
		})

		it('should classify as DebtRepayment when category is Other Incomes > Debt Repayment', () => {
			const row = createRow({
				[CsvKey.Amount]: '-500.00',
				[CsvKey.Category]: 'Other Incomes > Debt Repayment',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('DebtRepayment')
		})

		it('should classify as Windfall when category is Other Incomes > Windfall', () => {
			const row = createRow({
				[CsvKey.Amount]: '5000.00',
				[CsvKey.Category]: 'Other Incomes > Windfall',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Windfall')
		})

		it('should classify as Giveaway when category is Other Expenses > Giveaways', () => {
			const row = createRow({
				[CsvKey.Amount]: '-200.00',
				[CsvKey.Category]: 'Other Expenses > Giveaways',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Giveaway')
		})

		it('should prioritize special categories over Transfer classification', () => {
			const row = createRow({
				[CsvKey.Transfers]: 'Other Account (A)',
				[CsvKey.Amount]: '-1000.00',
				[CsvKey.Category]: 'Other Expenses > Debt',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Debt')
		})

		it('should classify special categories with ► separator', () => {
			const row = createRow({
				[CsvKey.Amount]: '-1000.00',
				[CsvKey.Category]: 'Other Expenses ► Debt',
			})

			const result = parseCsvRowToTransaction(row)

			expect(result.type).toBe('Debt')
		})
	})
})
