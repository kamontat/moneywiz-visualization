import { describe, it, expect, vi } from 'vitest'
import { parseTransactions, parseTransactionsFile } from './parser'
import * as csvLib from '$lib/csv'
import type { ParsedCsv } from '$lib/csv'

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
		it('should return empty array for now', () => {
			const mockCsv: ParsedCsv = {
				headers: ['h1'],
				rows: [{ h1: 'v1' }],
			}
			expect(parseTransactions(mockCsv)).toEqual([])
		})
	})

	describe('parseTransactionsFile', () => {
		it('should parse file and return transactions', async () => {
			const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' })
			const mockCsv: ParsedCsv = {
				headers: ['h1'],
				rows: [{ h1: 'v1' }],
			}

			vi.mocked(csvLib.parseCsvFile).mockResolvedValue(mockCsv)

			const result = await parseTransactionsFile(mockFile)

			expect(csvLib.parseCsvFile).toHaveBeenCalledWith(mockFile)
			expect(result).toEqual([])
		})
	})
})
