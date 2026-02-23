import type { SqlRow } from '$lib/source/sqlite/worker/utils'
import { describe, expect, it, vi } from 'vitest'

const { readRowsMock } = vi.hoisted(() => ({
	readRowsMock: vi.fn(),
}))

vi.mock('$lib/source/sqlite/worker/runtime', () => ({
	readRows: readRowsMock,
}))

import { extractLookups } from './lookups-extractor'

describe('extractLookups', () => {
	it('maps account opening balance from ZOPENINGBALANCE with fallback to ZOPENINGBALANCE1', () => {
		readRowsMock.mockImplementation((_, query: string): SqlRow[] => {
			if (query.includes('SELECT Z_ENT, Z_NAME FROM Z_PRIMARYKEY')) {
				return [
					{ Z_ENT: 10, Z_NAME: 'BankChequeAccount' },
					{ Z_ENT: 11, Z_NAME: 'BankSavingAccount' },
				]
			}
			if (query.includes('COUNT(*) AS row_count')) {
				return []
			}
			if (query.includes('WHERE Z_ENT BETWEEN')) {
				return [
					{
						Z_PK: 1,
						Z_ENT: 10,
						ZNAME: 'Main',
						ZOPENINGBALANCE: 123.45,
						ZARCHIVED: 0,
					},
					{
						Z_PK: 2,
						Z_ENT: 11,
						ZNAME: 'Fallback',
						ZOPENINGBALANCE1: 456.78,
						ZARCHIVED: 0,
					},
					{
						Z_PK: 3,
						Z_ENT: 11,
						ZNAME: 'Missing',
						ZARCHIVED: 0,
					},
				]
			}
			return []
		})

		const lookups = extractLookups({} as never)

		expect(lookups.accounts).toHaveLength(3)
		expect(lookups.accounts[0]?.openingBalance).toBe(123.45)
		expect(lookups.accounts[1]?.openingBalance).toBe(456.78)
		expect(lookups.accounts[2]?.openingBalance).toBe(0)
	})
})
