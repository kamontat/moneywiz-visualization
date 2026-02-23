import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import type {
	ParsedBaseTransaction,
	ParsedCategory,
} from '$lib/transactions/models'
import { describe, expect, it } from 'vitest'

import { classifyTransferEntity } from './transfer'

import { SQLITE_ENTITY_ID } from '$lib/source/sqlite/models'

const baseTransaction = (): ParsedBaseTransaction => ({
	account: { type: 'Checking', name: 'Main', extra: null },
	amount: { value: -100, currency: 'THB' },
	date: new Date('2026-01-01T00:00:00.000Z'),
	description: 'test',
	memo: '',
	tags: [],
	raw: {},
})

const sqliteRow = (entityId: number): SQLiteTransaction => ({
	id: 1,
	entityId,
	entityName: 'Entity',
	description: 'test',
	memo: '',
	senderAccount: { id: 10, name: 'From' },
	recipientAccount: { id: 11, name: 'To' },
	categories: [],
	tags: [],
})

const category = (name: string): ParsedCategory => ({
	category: name,
	subcategory: '',
})

const toAccount = (ref: SQLiteTransaction['account']) => ({
	type: 'Unknown' as const,
	name: ref?.name ?? 'Unknown',
	extra: null,
})

describe('classifyTransferEntity', () => {
	it('returns Transfer when transfer entity has no category', () => {
		const result = classifyTransferEntity(
			sqliteRow(SQLITE_ENTITY_ID.TransferWithdrawTransaction),
			baseTransaction(),
			{
				payee: 'Bank',
				hasCategory: false,
				category: category(''),
				amount: -100,
				toAccount,
			}
		)

		expect(result?.type).toBe('Transfer')
	})

	it('returns Income for transfer with income category and positive amount', () => {
		const result = classifyTransferEntity(
			sqliteRow(SQLITE_ENTITY_ID.TransferDepositTransaction),
			baseTransaction(),
			{
				payee: 'Bank',
				hasCategory: true,
				category: category('Other Incomes'),
				amount: 100,
				toAccount,
			}
		)

		expect(result?.type).toBe('Income')
	})

	it('returns Expense for transfer with category and negative amount', () => {
		const result = classifyTransferEntity(
			sqliteRow(SQLITE_ENTITY_ID.TransferDepositTransaction),
			baseTransaction(),
			{
				payee: 'Bank',
				hasCategory: true,
				category: category('Shopping'),
				amount: -100,
				toAccount,
			}
		)

		expect(result?.type).toBe('Expense')
	})

	it('returns undefined for non-transfer entity', () => {
		const result = classifyTransferEntity(sqliteRow(999), baseTransaction(), {
			payee: 'Bank',
			hasCategory: false,
			category: category(''),
			amount: -100,
			toAccount,
		})

		expect(result).toBeUndefined()
	})
})
