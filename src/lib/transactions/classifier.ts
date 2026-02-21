import type { ParsedAccount, ParsedAmount, ParsedTransaction } from './models'
import type {
	ParsedBaseTransaction,
	ParsedBuyTransaction,
	ParsedDebtRepaymentTransaction,
	ParsedDebtTransaction,
	ParsedExpenseTransaction,
	ParsedGiveawayTransaction,
	ParsedIncomeTransaction,
	ParsedReconcileTransaction,
	ParsedRefundTransaction,
	ParsedSellTransaction,
	ParsedTransferTransaction,
	ParsedUnknownTransaction,
	ParsedWindfallTransaction,
} from './models/transaction'
import type { SQLiteTransaction } from '$lib/sqlite/models'
import { DEFAULT_CURRENCY } from './constants'
import {
	isDebtCategory,
	isDebtRepaymentCategory,
	isGiveawayCategory,
	isIncomeCategory,
	isWindfallCategory,
	parseCategory,
	parseTag,
} from './utils'

import { SQLITE_ENTITY_ID } from '$lib/sqlite/constants'

const toAccount = (ref: SQLiteTransaction['account']): ParsedAccount => {
	if (!ref) return { type: 'Unknown', name: 'Unknown', extra: null }
	return { type: 'Unknown', name: ref.name, extra: null }
}

const toAccountFromEntity = (
	ref: SQLiteTransaction['account'],
	entityId: number
): ParsedAccount => {
	const name = ref?.name ?? 'Unknown'
	const entityName = ref?.entityName

	switch (entityId) {
		case SQLITE_ENTITY_ID.CashAccount:
			return { type: 'Wallet', name, extra: null }
		case SQLITE_ENTITY_ID.BankChequeAccount:
			return { type: 'Checking', name, extra: null }
		case SQLITE_ENTITY_ID.BankSavingAccount:
			return { type: 'Checking', name, extra: null }
		case SQLITE_ENTITY_ID.CreditCardAccount:
			return { type: 'CreditCard', name, extra: null }
		case SQLITE_ENTITY_ID.LoanAccount:
			return { type: 'Loan', name, extra: null }
		case SQLITE_ENTITY_ID.InvestmentAccount:
			return { type: 'Investment', name, extra: null }
		case SQLITE_ENTITY_ID.ForexAccount:
			return { type: 'Unknown', name, extra: null }
		default: {
			if (entityName === 'CashAccount')
				return { type: 'Wallet', name, extra: null }
			if (entityName === 'BankChequeAccount')
				return { type: 'Checking', name, extra: null }
			if (entityName === 'BankSavingAccount')
				return { type: 'Checking', name, extra: null }
			if (entityName === 'CreditCardAccount')
				return { type: 'CreditCard', name, extra: null }
			if (entityName === 'LoanAccount')
				return { type: 'Loan', name, extra: null }
			if (entityName === 'InvestmentAccount')
				return { type: 'Investment', name, extra: null }
			return { type: 'Unknown', name, extra: null }
		}
	}
}

const toAmount = (row: SQLiteTransaction): ParsedAmount => ({
	value: row.amount ?? 0,
	currency: row.currency ?? DEFAULT_CURRENCY,
})

const toDate = (row: SQLiteTransaction): Date => {
	if (!row.date) return new Date(0)
	const parsed = new Date(row.date)
	return isNaN(parsed.getTime()) ? new Date(0) : parsed
}

const toTags = (row: SQLiteTransaction) =>
	row.tags.flatMap((tag) => parseTag(tag.name))

const toCategoryString = (row: SQLiteTransaction): string => {
	if (row.categories.length === 0) return ''
	const cat = row.categories[0]
	if (cat.parentName) return `${cat.parentName} > ${cat.name}`
	return cat.name
}

const isTransferEntity = (entityId: number): boolean =>
	entityId === SQLITE_ENTITY_ID.TransferDepositTransaction ||
	entityId === SQLITE_ENTITY_ID.TransferWithdrawTransaction ||
	entityId === SQLITE_ENTITY_ID.TransferBudgetTransaction

const isInvestmentBuyEntity = (entityId: number): boolean =>
	entityId === SQLITE_ENTITY_ID.InvestmentBuyTransaction

const isInvestmentSellEntity = (entityId: number): boolean =>
	entityId === SQLITE_ENTITY_ID.InvestmentSellTransaction

const isReconcileEntity = (entityId: number): boolean =>
	entityId === SQLITE_ENTITY_ID.ReconcileTransaction

const isRefundEntity = (entityId: number): boolean =>
	entityId === SQLITE_ENTITY_ID.RefundTransaction

export const classifySQLiteTransaction = (
	row: SQLiteTransaction
): ParsedTransaction => {
	const account = row.account
		? toAccountFromEntity(row.account, row.account.entityId ?? 0)
		: toAccount(row.account)
	const amount = toAmount(row)
	const date = toDate(row)
	const description = row.description
	const memo = row.memo
	const tags = toTags(row)
	const payee = row.payee?.name ?? ''

	const base: ParsedBaseTransaction = {
		account,
		amount,
		date,
		description,
		memo,
		tags,
		raw: { ...row },
	}

	const categoryField = toCategoryString(row)
	const category = parseCategory(categoryField)
	const hasCategory = categoryField.trim() !== ''
	const checkNumber = ''

	if (isDebtCategory(category)) {
		return {
			...base,
			type: 'Debt',
			payee,
			category,
			checkNumber,
		} as ParsedDebtTransaction
	}

	if (isDebtRepaymentCategory(category)) {
		return {
			...base,
			type: 'DebtRepayment',
			payee,
			category,
			checkNumber,
		} as ParsedDebtRepaymentTransaction
	}

	if (isWindfallCategory(category)) {
		return {
			...base,
			type: 'Windfall',
			payee,
			category,
			checkNumber,
		} as ParsedWindfallTransaction
	}

	if (isGiveawayCategory(category)) {
		return {
			...base,
			type: 'Giveaway',
			payee,
			category,
			checkNumber,
		} as ParsedGiveawayTransaction
	}

	if (isReconcileEntity(row.entityId)) {
		return {
			...base,
			type: 'Reconcile',
			payee,
			checkNumber,
		} as ParsedReconcileTransaction
	}

	// Transfer classification:
	// SQLite entity types TransferDeposit/TransferWithdraw/TransferBudget
	// or presence of senderAccount + recipientAccount
	if (isTransferEntity(row.entityId)) {
		if (hasCategory) {
			if (amount.value > 0 && isIncomeCategory(category)) {
				return {
					...base,
					type: 'Income',
					payee,
					category,
					checkNumber,
				} as ParsedIncomeTransaction
			}

			if (amount.value < 0) {
				return {
					...base,
					type: 'Expense',
					payee,
					category,
					checkNumber,
				} as ParsedExpenseTransaction
			}

			if (isIncomeCategory(category)) {
				return {
					...base,
					type: 'Unknown',
				} as ParsedUnknownTransaction
			}

			return {
				...base,
				type: 'Refund',
				payee,
				category,
				checkNumber,
			} as ParsedRefundTransaction
		}

		const transferAccount = row.recipientAccount ?? row.senderAccount
		return {
			...base,
			type: 'Transfer',
			transfer: toAccount(transferAccount),
		} as ParsedTransferTransaction
	}

	if (isRefundEntity(row.entityId)) {
		return {
			...base,
			type: 'Refund',
			payee,
			category,
			checkNumber,
		} as ParsedRefundTransaction
	}

	if (isInvestmentBuyEntity(row.entityId)) {
		return {
			...base,
			type: 'Buy',
			payee,
			checkNumber,
		} as ParsedBuyTransaction
	}

	if (isInvestmentSellEntity(row.entityId)) {
		return {
			...base,
			type: 'Sell',
			payee,
			checkNumber,
		} as ParsedSellTransaction
	}

	if (account.type === 'Investment' && !hasCategory) {
		if (amount.value > 0) {
			return {
				...base,
				type: 'Sell',
				payee,
				checkNumber,
			} as ParsedSellTransaction
		}
		if (amount.value < 0) {
			return {
				...base,
				type: 'Buy',
				payee,
				checkNumber,
			} as ParsedBuyTransaction
		}
	}

	// Standard classification:
	// - Income: Amount > 0 AND category starts with Compensation or Income
	// - Expense: Amount < 0 AND NOT income category
	// - Refund: requires category and NOT income category
	// - Unknown: fallback when category is missing
	if (amount.value > 0 && isIncomeCategory(category)) {
		return {
			...base,
			type: 'Income',
			payee,
			category,
			checkNumber,
		} as ParsedIncomeTransaction
	}

	if (amount.value < 0) {
		return {
			...base,
			type: 'Expense',
			payee,
			category,
			checkNumber,
		} as ParsedExpenseTransaction
	}

	if (!hasCategory) {
		return {
			...base,
			type: 'Unknown',
		} as ParsedUnknownTransaction
	}

	if (isIncomeCategory(category)) {
		return {
			...base,
			type: 'Unknown',
		} as ParsedUnknownTransaction
	}

	// Fallback with expense category = Refund
	return {
		...base,
		type: 'Refund',
		payee,
		category,
		checkNumber,
	} as ParsedRefundTransaction
}
