import type { ParsedCsv } from '$lib/csv'
import { describe, it, expect, vi } from 'vitest'

import { parseTransactions, parseTransactionsFile } from './parser'

import * as csvLib from '$lib/csv'

// Mock the $lib/csv module
vi.mock('$lib/csv', async (importOriginal) => {
	const actual = await importOriginal<typeof csvLib>()
	return {
		...actual,
		parseCsvFile: vi.fn(),
	}
})

describe('transactions/parser', () => {
	describe('parseTransactions', () => {
		it('should parse transactions correctly', () => {
			const mockCsv: ParsedCsv = {
				headers: [
					'Account',
					'Transfers',
					'Description',
					'Payee',
					'Category',
					'Date',
					'Time',
					'Memo',
					'Amount',
					'Currency',
					'Check #',
					'Tags',
				],
				rows: [
					{
						Account: 'Wallet (W)',
						Transfers: '',
						Description: 'Lunch',
						Payee: 'Restaurant',
						Category: 'Food > Lunch',
						Date: '01/01/2023',
						Time: '12:00',
						Memo: 'Yummy',
						Amount: '-100',
						Currency: 'THB',
						'Check #': '',
						Tags: 'Tag1',
					},
					{
						Account: 'Bank (A)',
						Transfers: '',
						Description: 'Salary',
						Payee: 'Company',
						Category: 'Income > Salary',
						Date: '25/01/2023',
						Time: '',
						Memo: '',
						Amount: '50000',
						Currency: 'THB',
						'Check #': '',
						Tags: '',
					},
					{
						Account: 'Bank (A)',
						Transfers: 'Wallet (W)',
						Description: 'Withdrawal',
						Payee: '',
						Category: '',
						Date: '02/01/2023',
						Time: '10:00',
						Memo: '',
						Amount: '-1000',
						Currency: 'THB',
						'Check #': '',
						Tags: '',
					},
				],
			}

			const result = parseTransactions(mockCsv)

			expect(result).toHaveLength(3)

			// Expense
			expect(result[0]).toMatchObject({
				type: 'Expense',
				account: { name: 'Wallet', type: 'Wallet' },
				amount: { value: -100, currency: 'THB' },
				category: { category: 'Food', subcategory: 'Lunch' },
				payee: 'Restaurant',
			})
			expect(result[0].date).toEqual(new Date(2023, 0, 1, 12, 0))

			// Income
			expect(result[1]).toMatchObject({
				type: 'Income',
				account: { name: 'Bank', type: 'Checking' },
				amount: { value: 50000 },
			})
			expect(result[1].date).toEqual(new Date(2023, 0, 25, 0, 0))

			// Transfer
			expect(result[2]).toMatchObject({
				type: 'Transfer',
				account: { name: 'Bank' },
				transfer: { name: 'Wallet' },
				amount: { value: -1000 },
			})
		})

		it('should handle missing optional fields', () => {
			const mockCsv: ParsedCsv = {
				headers: ['Account', 'Amount', 'Date'],
				rows: [
					{
						// Completely empty/malformed row to test all fallbacks
					},
				],
			}

			const result = parseTransactions(mockCsv)

			expect(result[0]).toMatchObject({
				description: '',
				memo: '',
				tags: [],
				payee: '',
				checkNumber: '',
				category: { category: '', subcategory: '' },
				account: { name: '', type: 'Unknown' }, // parseAccount('') defaults
			})
			expect(result[0].date).toBeInstanceOf(Date)
		})
	})

	describe('parseTransactionsFile', () => {
		it('should parse file and return transactions', async () => {
			const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' })
			const mockCsv: ParsedCsv = {
				headers: ['Account'],
				rows: [{ Account: 'Bank (A)' }],
			}

			vi.mocked(csvLib.parseCsvFile).mockResolvedValue(mockCsv)

			const result = await parseTransactionsFile(mockFile)

			expect(csvLib.parseCsvFile).toHaveBeenCalledWith(mockFile)
			expect(result).toHaveLength(1)
			expect(result[0].account.name).toBe('Bank')
		})
	})
})
