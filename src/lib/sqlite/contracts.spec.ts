import { describe, it, expect } from 'vitest'

import { SQLITE_ENTITY_ID } from './constants'

/**
 * Contract tests for SQLite entity mapping invariants from DATABASE_SCHEMA.md.
 * These validate that the hardcoded entity IDs and query patterns in parser.ts
 * and worker.ts match the documented Core Data schema.
 *
 * Per DATABASE_SCHEMA.md Entity Id Map:
 *   Account subtypes: Z_ENT 10-16 (BankChequeAccount through ForexAccount)
 *   Category:         Z_ENT = 19
 *   Payee:            Z_ENT = 28
 *   Tag:              Z_ENT = 35
 *   Transaction:      Z_ENT = 36+ (all entity names ending in 'Transaction')
 */

describe('DATABASE_SCHEMA.md entity mapping contracts', () => {
	describe('Account entity range', () => {
		it('account subtypes should span Z_ENT 10..16 (used in SQL WHERE Z_ENT BETWEEN 10 AND 16)', () => {
			const accountSubtypes = [
				SQLITE_ENTITY_ID.BankChequeAccount,
				SQLITE_ENTITY_ID.BankSavingAccount,
				SQLITE_ENTITY_ID.CashAccount,
				SQLITE_ENTITY_ID.CreditCardAccount,
				SQLITE_ENTITY_ID.LoanAccount,
				SQLITE_ENTITY_ID.InvestmentAccount,
				SQLITE_ENTITY_ID.ForexAccount,
			]

			expect(Math.min(...accountSubtypes)).toBe(10)
			expect(Math.max(...accountSubtypes)).toBe(16)
			expect(accountSubtypes).toHaveLength(7)

			for (let i = 10; i <= 16; i++) {
				expect(accountSubtypes).toContain(i)
			}
		})

		it('Account base entity (Z_ENT=9) should NOT be in the account subtype range', () => {
			expect(SQLITE_ENTITY_ID.Account).toBe(9)
			expect(SQLITE_ENTITY_ID.Account).toBeLessThan(10)
		})
	})

	describe('Category entity', () => {
		it('should use Z_ENT = 19 (used in SQL WHERE Z_ENT = 19)', () => {
			expect(SQLITE_ENTITY_ID.Category).toBe(19)
		})
	})

	describe('Payee entity', () => {
		it('should use Z_ENT = 28 (used in SQL WHERE Z_ENT = 28)', () => {
			expect(SQLITE_ENTITY_ID.Payee).toBe(28)
		})
	})

	describe('Tag entity', () => {
		it('should use Z_ENT = 35 (used in SQL WHERE Z_ENT = 35)', () => {
			expect(SQLITE_ENTITY_ID.Tag).toBe(35)
		})
	})

	describe('Transaction entity family', () => {
		it('all transaction entity names should end with Transaction', () => {
			const transactionEntities = Object.entries(SQLITE_ENTITY_ID)
				.filter(([, id]) => id >= 36 && id <= 47)
				.map(([name]) => name)

			for (const name of transactionEntities) {
				expect(name).toMatch(/Transaction$/)
			}
		})

		it('transaction entity IDs should be contiguous from 36..47', () => {
			const transactionEntityIds = Object.entries(SQLITE_ENTITY_ID)
				.filter(([name]) => name.endsWith('Transaction'))
				.filter(([, id]) => id >= 36)
				.map(([, id]) => id)
				.sort((a, b) => a - b)

			expect(transactionEntityIds[0]).toBe(36)
			expect(transactionEntityIds[transactionEntityIds.length - 1]).toBe(47)
			expect(transactionEntityIds).toHaveLength(12)
		})

		it('ScheduledTransactionHandler subtypes should NOT be in transaction range', () => {
			expect(SQLITE_ENTITY_ID.ScheduledTransactionHandler).toBe(31)
			expect(SQLITE_ENTITY_ID.ScheduledDepositTransactionHandler).toBe(32)
			expect(SQLITE_ENTITY_ID.ScheduledTransferTransactionHandler).toBe(33)
			expect(SQLITE_ENTITY_ID.ScheduledWithdrawTransactionHandler).toBe(34)
		})
	})

	describe('Relation table contracts', () => {
		it('ZCATEGORYASSIGMENT links transactions (Z_ENT=36+) to categories (Z_ENT=19)', () => {
			expect(SQLITE_ENTITY_ID.CategoryAssigment).toBe(2)
			expect(SQLITE_ENTITY_ID.Transaction).toBe(36)
			expect(SQLITE_ENTITY_ID.Category).toBe(19)
		})

		it('Z_36TAGS links transactions to tags (Z_ENT=35)', () => {
			expect(SQLITE_ENTITY_ID.Transaction).toBe(36)
			expect(SQLITE_ENTITY_ID.Tag).toBe(35)
		})
	})

	describe('Apple Core Data epoch', () => {
		it('should use 2001-01-01T00:00:00Z as reference epoch', () => {
			const APPLE_REFERENCE_EPOCH_MS = Date.UTC(2001, 0, 1, 0, 0, 0)
			expect(APPLE_REFERENCE_EPOCH_MS).toBe(978307200000)

			const testTimestamp = 0
			const date = new Date(APPLE_REFERENCE_EPOCH_MS + testTimestamp * 1000)
			expect(date.toISOString()).toBe('2001-01-01T00:00:00.000Z')
		})

		it('should correctly convert a known Core Data timestamp', () => {
			const APPLE_REFERENCE_EPOCH_MS = Date.UTC(2001, 0, 1, 0, 0, 0)
			const timestamp = 788918400
			const date = new Date(APPLE_REFERENCE_EPOCH_MS + timestamp * 1000)
			expect(date.toISOString()).toBe('2026-01-01T00:00:00.000Z')
		})
	})
})
