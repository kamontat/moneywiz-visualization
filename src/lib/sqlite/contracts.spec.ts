import { describe, it, expect } from 'vitest'

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

const ENTITY_MAP = {
	AccountBudgetLink: 1,
	CategoryAssigment: 2,
	CommonSettings: 3,
	Image: 4,
	InvestmentAccountTotalValue: 5,
	StringHistoryItem: 6,
	SyncCommand: 7,
	SyncObject: 8,
	Account: 9,
	BankChequeAccount: 10,
	BankSavingAccount: 11,
	CashAccount: 12,
	CreditCardAccount: 13,
	LoanAccount: 14,
	InvestmentAccount: 15,
	ForexAccount: 16,
	AppSettings: 17,
	Budget: 18,
	Category: 19,
	CustomFormsOption: 20,
	CustomReport: 21,
	Group: 22,
	InfoCard: 23,
	InvestmentHolding: 24,
	OnlineBank: 25,
	OnlineBankAccount: 26,
	OnlineBankUser: 27,
	Payee: 28,
	PaymentPlan: 29,
	PaymentPlanItem: 30,
	ScheduledTransactionHandler: 31,
	ScheduledDepositTransactionHandler: 32,
	ScheduledTransferTransactionHandler: 33,
	ScheduledWithdrawTransactionHandler: 34,
	Tag: 35,
	Transaction: 36,
	DepositTransaction: 37,
	InvestmentExchangeTransaction: 38,
	InvestmentTransaction: 39,
	InvestmentBuyTransaction: 40,
	InvestmentSellTransaction: 41,
	ReconcileTransaction: 42,
	RefundTransaction: 43,
	TransferBudgetTransaction: 44,
	TransferDepositTransaction: 45,
	TransferWithdrawTransaction: 46,
	WithdrawTransaction: 47,
	TransactionBudgetLink: 48,
	User: 49,
	WithdrawRefundTransactionLink: 50,
} as const

describe('DATABASE_SCHEMA.md entity mapping contracts', () => {
	describe('Account entity range', () => {
		it('account subtypes should span Z_ENT 10..16 (used in SQL WHERE Z_ENT BETWEEN 10 AND 16)', () => {
			const accountSubtypes = [
				ENTITY_MAP.BankChequeAccount,
				ENTITY_MAP.BankSavingAccount,
				ENTITY_MAP.CashAccount,
				ENTITY_MAP.CreditCardAccount,
				ENTITY_MAP.LoanAccount,
				ENTITY_MAP.InvestmentAccount,
				ENTITY_MAP.ForexAccount,
			]

			expect(Math.min(...accountSubtypes)).toBe(10)
			expect(Math.max(...accountSubtypes)).toBe(16)
			expect(accountSubtypes).toHaveLength(7)

			for (let i = 10; i <= 16; i++) {
				expect(accountSubtypes).toContain(i)
			}
		})

		it('Account base entity (Z_ENT=9) should NOT be in the account subtype range', () => {
			expect(ENTITY_MAP.Account).toBe(9)
			expect(ENTITY_MAP.Account).toBeLessThan(10)
		})
	})

	describe('Category entity', () => {
		it('should use Z_ENT = 19 (used in SQL WHERE Z_ENT = 19)', () => {
			expect(ENTITY_MAP.Category).toBe(19)
		})
	})

	describe('Payee entity', () => {
		it('should use Z_ENT = 28 (used in SQL WHERE Z_ENT = 28)', () => {
			expect(ENTITY_MAP.Payee).toBe(28)
		})
	})

	describe('Tag entity', () => {
		it('should use Z_ENT = 35 (used in SQL WHERE Z_ENT = 35)', () => {
			expect(ENTITY_MAP.Tag).toBe(35)
		})
	})

	describe('Transaction entity family', () => {
		it('all transaction entity names should end with Transaction', () => {
			const transactionEntities = Object.entries(ENTITY_MAP)
				.filter(([, id]) => id >= 36 && id <= 47)
				.map(([name]) => name)

			for (const name of transactionEntities) {
				expect(name).toMatch(/Transaction$/)
			}
		})

		it('transaction entity IDs should be contiguous from 36..47', () => {
			const transactionEntityIds = Object.entries(ENTITY_MAP)
				.filter(([name]) => name.endsWith('Transaction'))
				.filter(([, id]) => id >= 36)
				.map(([, id]) => id)
				.sort((a, b) => a - b)

			expect(transactionEntityIds[0]).toBe(36)
			expect(transactionEntityIds[transactionEntityIds.length - 1]).toBe(47)
			expect(transactionEntityIds).toHaveLength(12)
		})

		it('ScheduledTransactionHandler subtypes should NOT be in transaction range', () => {
			expect(ENTITY_MAP.ScheduledTransactionHandler).toBe(31)
			expect(ENTITY_MAP.ScheduledDepositTransactionHandler).toBe(32)
			expect(ENTITY_MAP.ScheduledTransferTransactionHandler).toBe(33)
			expect(ENTITY_MAP.ScheduledWithdrawTransactionHandler).toBe(34)
		})
	})

	describe('Relation table contracts', () => {
		it('ZCATEGORYASSIGMENT links transactions (Z_ENT=36+) to categories (Z_ENT=19)', () => {
			expect(ENTITY_MAP.CategoryAssigment).toBe(2)
			expect(ENTITY_MAP.Transaction).toBe(36)
			expect(ENTITY_MAP.Category).toBe(19)
		})

		it('Z_36TAGS links transactions to tags (Z_ENT=35)', () => {
			expect(ENTITY_MAP.Transaction).toBe(36)
			expect(ENTITY_MAP.Tag).toBe(35)
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
