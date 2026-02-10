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

		it('should classify as Expense when Transfers field AND Category are populated', async () => {
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

			expect(result[0].type).toBe('Expense')
			expect('payee' in result[0] && result[0].payee).toBe('Credit Card')
			expect('category' in result[0] && result[0].category.category).toBe(
				'Bills'
			)
		})
	})

	describe('New Balance Detection', () => {
		it('should classify as NewBalance when category is empty and description is new balance', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Category]: '',
				[CsvKey.Description]: 'New Balance',
				[CsvKey.Amount]: '1200.00',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('NewBalance')
		})

		it('should classify as NewBalance with case-insensitive description', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Category]: '',
				[CsvKey.Description]: '  new balance  ',
				[CsvKey.Amount]: '-50.00',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('NewBalance')
		})

		it('should not classify as NewBalance when category exists', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Category]: 'Food > Restaurant',
				[CsvKey.Description]: 'New Balance',
				[CsvKey.Amount]: '-50.00',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Expense')
		})
	})

	describe('Investment Buy/Sell Detection', () => {
		it('should classify as Sell when investment account has no category and amount > 0', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Account]: 'Broker Account (I)',
				[CsvKey.Category]: '',
				[CsvKey.Amount]: '1500.00',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Sell')
		})

		it('should classify as Buy when investment account has no category and amount < 0', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Account]: 'Broker Account (I)',
				[CsvKey.Category]: '',
				[CsvKey.Amount]: '-1500.00',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Buy')
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

		it('should classify as Income when amount > 0 AND category is Other Incomes > Interest', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '100.00',
				[CsvKey.Category]: 'Other Incomes > Interest',
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

	describe('Unknown Detection', () => {
		it('should classify as Unknown when amount > 0 and category is empty', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '50.00',
				[CsvKey.Category]: '',
				[CsvKey.Description]: 'Balance adjustment',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Unknown')
		})

		it('should classify as Unknown when amount is zero and category is empty', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '0.00',
				[CsvKey.Category]: '',
				[CsvKey.Description]: 'Zero balance line',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Unknown')
		})

		it('should classify as Unknown when amount is zero and category is income category', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '0.00',
				[CsvKey.Category]: 'Compensation > Salary',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Unknown')
		})

		it('should classify transfer with zero amount and income category as Unknown', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Transfers]: 'Other Account (A)',
				[CsvKey.Amount]: '0.00',
				[CsvKey.Category]: 'Compensation > Salary',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Unknown')
		})
	})

	describe('Special Category Detection', () => {
		it('should classify as Debt when category is Other Expenses > Debt', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '-1000.00',
				[CsvKey.Category]: 'Other Expenses > Debt',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Debt')
		})

		it('should classify as DebtRepayment when category is Other Incomes > Debt Repayment', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '-500.00',
				[CsvKey.Category]: 'Other Incomes > Debt Repayment',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('DebtRepayment')
		})

		it('should classify as Windfall when category is Other Incomes > Windfall', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '5000.00',
				[CsvKey.Category]: 'Other Incomes > Windfall',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Windfall')
		})

		it('should classify as Giveaway when category is Other Expenses > Giveaways', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '-200.00',
				[CsvKey.Category]: 'Other Expenses > Giveaways',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Giveaway')
		})

		it('should prioritize special categories over Transfer classification', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Transfers]: 'Other Account (A)',
				[CsvKey.Amount]: '-1000.00',
				[CsvKey.Category]: 'Other Expenses > Debt',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Debt')
		})

		it('should classify special categories with ► separator', async () => {
			const { parseTransactions } = await import('./parser')

			const row = createRow({
				[CsvKey.Amount]: '-1000.00',
				[CsvKey.Category]: 'Other Expenses ► Debt',
			})

			const result = parseTransactions({
				headers: Object.keys(row),
				rows: [row],
			})

			expect(result[0].type).toBe('Debt')
		})
	})
})
