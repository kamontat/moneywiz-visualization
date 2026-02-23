import { describe, expect, it } from 'vitest'

import { SQLITE_ENTITY_ID } from './entity-map'

/**
 * Contract tests for SQLite entity mapping invariants from SQLITE schema docs.
 */
describe('SQLITE entity mapping contracts', () => {
	describe('account entity range', () => {
		it('account subtypes should span Z_ENT 10..16', () => {
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

		it('Account base entity (Z_ENT=9) is not in account subtype range', () => {
			expect(SQLITE_ENTITY_ID.Account).toBe(9)
			expect(SQLITE_ENTITY_ID.Account).toBeLessThan(10)
		})
	})

	describe('core entities', () => {
		it('Category should use Z_ENT = 19', () => {
			expect(SQLITE_ENTITY_ID.Category).toBe(19)
		})

		it('Payee should use Z_ENT = 28', () => {
			expect(SQLITE_ENTITY_ID.Payee).toBe(28)
		})

		it('Tag should use Z_ENT = 35', () => {
			expect(SQLITE_ENTITY_ID.Tag).toBe(35)
		})
	})

	describe('transaction family', () => {
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

		it('scheduled handlers should not be in transaction range', () => {
			expect(SQLITE_ENTITY_ID.ScheduledTransactionHandler).toBe(31)
			expect(SQLITE_ENTITY_ID.ScheduledDepositTransactionHandler).toBe(32)
			expect(SQLITE_ENTITY_ID.ScheduledTransferTransactionHandler).toBe(33)
			expect(SQLITE_ENTITY_ID.ScheduledWithdrawTransactionHandler).toBe(34)
		})
	})

	describe('relation entities', () => {
		it('ZCATEGORYASSIGMENT links transaction entities to categories', () => {
			expect(SQLITE_ENTITY_ID.CategoryAssigment).toBe(2)
			expect(SQLITE_ENTITY_ID.Transaction).toBe(36)
			expect(SQLITE_ENTITY_ID.Category).toBe(19)
		})

		it('Z_36TAGS links transactions to tags', () => {
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
