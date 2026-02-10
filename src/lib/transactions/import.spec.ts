import type { ParsedCsvRow } from '$lib/csv/models'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CsvKey } from './csv'
import {
	detectCsvDelimiter,
	importTransactionsFromFile,
	stripCsvPreamble,
} from './import'

const { parseMock, putMock, transactionMock } = vi.hoisted(() => {
	const parseMock = vi.fn()
	const putMock = vi.fn()
	const transactionMock = vi.fn(async () => ({
		store: { put: putMock },
		done: Promise.resolve(),
	}))

	return {
		parseMock,
		putMock,
		transactionMock,
	}
})

vi.mock('papaparse', () => ({
	default: {
		parse: parseMock,
	},
}))

vi.mock('$utils/stores', () => ({
	indexDBV1: {
		transaction: transactionMock,
		delete: vi.fn(),
	},
	STATE_TRX_V1: 'mw_transaction_v1',
}))

const newTransactionRow = (
	overrides: Partial<ParsedCsvRow> = {}
): ParsedCsvRow => ({
	[CsvKey.Name]: '',
	[CsvKey.CurrentBalance]: '',
	[CsvKey.Account]: 'Test Account (A)',
	[CsvKey.Transfers]: '',
	[CsvKey.Description]: 'Test',
	[CsvKey.Payee]: 'Payee',
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

const accountHeaderRow: ParsedCsvRow = {
	[CsvKey.Name]: 'Wallet [THB] (W)',
	[CsvKey.CurrentBalance]: '1,000.00',
}

describe('detectCsvDelimiter', () => {
	it('detects delimiter from sep preamble with BOM and leading empty lines', async () => {
		const file = new File(
			['\uFEFF\n\nsep=;\n"col1";"col2"\n"value1";"value2"'],
			'test.csv',
			{ type: 'text/csv' }
		)

		const delimiter = await detectCsvDelimiter(file)
		expect(delimiter).toBe(';')
	})

	it('returns comma when no sep preamble exists', async () => {
		const file = new File(['"col1","col2"\n"value1","value2"'], 'test.csv', {
			type: 'text/csv',
		})

		const delimiter = await detectCsvDelimiter(file)
		expect(delimiter).toBe(',')
	})

	it('supports sep comma preamble', async () => {
		const file = new File(
			['sep=,\n"col1","col2"\n"value1","value2"'],
			'test.csv',
			{
				type: 'text/csv',
			}
		)

		const delimiter = await detectCsvDelimiter(file)
		expect(delimiter).toBe(',')
	})
})

describe('stripCsvPreamble', () => {
	it('removes BOM, leading empty lines and sep line from first chunk', () => {
		const chunk = '\uFEFF\n\nsep=;\n"col1";"col2"\n"value1";"value2"'
		const cleaned = stripCsvPreamble(chunk)
		expect(cleaned).toBe('"col1";"col2"\n"value1";"value2"')
	})
})

describe('importTransactionsFromFile', () => {
	beforeEach(() => {
		parseMock.mockReset()
		putMock.mockReset()
		transactionMock.mockClear()
	})

	it('skips account headers and flushes exact batch boundaries', async () => {
		const rows = [
			accountHeaderRow,
			newTransactionRow({ [CsvKey.Description]: 't1' }),
			newTransactionRow({ [CsvKey.Description]: 't2' }),
			newTransactionRow({ [CsvKey.Description]: 't3' }),
			newTransactionRow({ [CsvKey.Description]: 't4' }),
		]

		parseMock.mockImplementation((_file: File, config: any) => {
			let paused = false
			const parser = {
				pause: () => {
					paused = true
				},
				resume: () => {
					paused = false
					run()
				},
				abort: vi.fn(),
			}

			const chunks = [
				{ data: rows.slice(0, 3), errors: [], meta: { cursor: 48 } },
				{ data: rows.slice(3), errors: [], meta: { cursor: 96 } },
			]

			const run = () => {
				if (paused) return
				const chunk = chunks.shift()
				if (!chunk) {
					config.complete?.()
					return
				}
				config.chunk?.(chunk, parser)
			}

			run()
		})

		const progressEvents: Array<{ phase: string; percentage: number }> = []
		const file = new File(['x'.repeat(96)], 'large.csv', { type: 'text/csv' })
		const imported = await importTransactionsFromFile(file, {
			batchSize: 2,
			onProgress: (progress) => {
				progressEvents.push({
					phase: progress.phase,
					percentage: progress.percentage,
				})
			},
		})

		expect(imported).toBe(4)
		expect(transactionMock).toHaveBeenCalledTimes(2)
		expect(putMock).toHaveBeenCalledTimes(4)
		expect(progressEvents.at(-1)).toEqual({
			phase: 'complete',
			percentage: 100,
		})
	})

	it('flushes final remainder batch', async () => {
		const rows = [
			newTransactionRow({ [CsvKey.Description]: 't1' }),
			newTransactionRow({ [CsvKey.Description]: 't2' }),
			newTransactionRow({ [CsvKey.Description]: 't3' }),
		]

		parseMock.mockImplementation((_file: File, config: any) => {
			let paused = false
			const parser = {
				pause: () => {
					paused = true
				},
				resume: () => {
					paused = false
					run()
				},
				abort: vi.fn(),
			}

			const chunks = [{ data: rows, errors: [], meta: { cursor: 64 } }]

			const run = () => {
				if (paused) return
				const chunk = chunks.shift()
				if (!chunk) {
					config.complete?.()
					return
				}
				config.chunk?.(chunk, parser)
			}

			run()
		})

		const file = new File(['x'.repeat(64)], 'large.csv', { type: 'text/csv' })
		const imported = await importTransactionsFromFile(file, {
			batchSize: 2,
		})

		expect(imported).toBe(3)
		expect(transactionMock).toHaveBeenCalledTimes(2)
		expect(putMock).toHaveBeenCalledTimes(3)
	})
})
