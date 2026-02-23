import type { ParsedBaseTransaction } from '$lib/ledger/models'
import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import { describe, expect, it } from 'vitest'

import {
	classifyInvestmentEntity,
	classifyInvestmentFallback,
} from './investment'

import { SQLITE_ENTITY_ID } from '$lib/source/sqlite/models'

const baseTransaction = (): ParsedBaseTransaction => ({
	account: { type: 'Investment', name: 'Portfolio', extra: null },
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

describe('classifyInvestmentEntity', () => {
	it('maps investment buy entity to Buy', () => {
		const result = classifyInvestmentEntity(
			sqliteRow(SQLITE_ENTITY_ID.InvestmentBuyTransaction),
			baseTransaction(),
			'Broker'
		)

		expect(result?.type).toBe('Buy')
	})

	it('maps investment sell entity to Sell', () => {
		const result = classifyInvestmentEntity(
			sqliteRow(SQLITE_ENTITY_ID.InvestmentSellTransaction),
			baseTransaction(),
			'Broker'
		)

		expect(result?.type).toBe('Sell')
	})

	it('returns undefined for non-investment entity', () => {
		const result = classifyInvestmentEntity(
			sqliteRow(999),
			baseTransaction(),
			'Broker'
		)

		expect(result).toBeUndefined()
	})
})

describe('classifyInvestmentFallback', () => {
	it('returns Sell for investment account with positive amount and no category', () => {
		const result = classifyInvestmentFallback(baseTransaction(), {
			accountType: 'Investment',
			hasCategory: false,
			amount: 10,
			payee: 'Broker',
		})

		expect(result?.type).toBe('Sell')
	})

	it('returns Buy for investment account with negative amount and no category', () => {
		const result = classifyInvestmentFallback(baseTransaction(), {
			accountType: 'Investment',
			hasCategory: false,
			amount: -10,
			payee: 'Broker',
		})

		expect(result?.type).toBe('Buy')
	})

	it('returns undefined when account is not investment', () => {
		const result = classifyInvestmentFallback(baseTransaction(), {
			accountType: 'Checking',
			hasCategory: false,
			amount: -10,
			payee: 'Broker',
		})

		expect(result).toBeUndefined()
	})
})
