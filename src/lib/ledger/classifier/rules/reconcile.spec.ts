import type { ParsedBaseTransaction } from '$lib/ledger/models'
import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import { describe, expect, it } from 'vitest'

import { classifyReconcile, isReconcileEntity } from './reconcile'

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
	categories: [],
	tags: [],
})

describe('isReconcileEntity', () => {
	it('returns true only for reconcile entity id', () => {
		expect(isReconcileEntity(SQLITE_ENTITY_ID.ReconcileTransaction)).toBe(true)
		expect(isReconcileEntity(999)).toBe(false)
	})
})

describe('classifyReconcile', () => {
	it('returns Reconcile for reconcile entity', () => {
		const result = classifyReconcile(
			sqliteRow(SQLITE_ENTITY_ID.ReconcileTransaction),
			baseTransaction(),
			'Bank'
		)

		expect(result?.type).toBe('Reconcile')
	})

	it('returns undefined for non-reconcile entity', () => {
		const result = classifyReconcile(sqliteRow(999), baseTransaction(), 'Bank')

		expect(result).toBeUndefined()
	})
})
