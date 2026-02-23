import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import type {
	ParsedAccount,
	ParsedAmount,
	ParsedBaseTransaction,
	ParsedRefundTransaction,
	ParsedTransaction,
} from '$lib/transactions/models'
import {
	classifyDebtCategory,
	classifyIncomeExpenseFallback,
	classifyInvestmentEntity,
	classifyInvestmentFallback,
	classifyReconcile,
	classifyTransferEntity,
} from './rules'

import { SQLITE_ENTITY_ID } from '$lib/source/sqlite/models'
import { DEFAULT_CURRENCY } from '$lib/transactions/constants'
import { parseCategory, parseTag } from '$lib/transactions/utils'

const CHECK_NUMBER = ''

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
		case SQLITE_ENTITY_ID.BankSavingAccount:
			return { type: 'Checking', name, extra: null }
		case SQLITE_ENTITY_ID.CreditCardAccount:
			return { type: 'CreditCard', name, extra: null }
		case SQLITE_ENTITY_ID.LoanAccount:
			return { type: 'Loan', name, extra: null }
		case SQLITE_ENTITY_ID.InvestmentAccount:
			return { type: 'Investment', name, extra: null }
		default:
			if (entityName === 'CashAccount') {
				return { type: 'Wallet', name, extra: null }
			}
			if (
				entityName === 'BankChequeAccount' ||
				entityName === 'BankSavingAccount'
			) {
				return { type: 'Checking', name, extra: null }
			}
			if (entityName === 'CreditCardAccount') {
				return { type: 'CreditCard', name, extra: null }
			}
			if (entityName === 'LoanAccount') {
				return { type: 'Loan', name, extra: null }
			}
			if (entityName === 'InvestmentAccount') {
				return { type: 'Investment', name, extra: null }
			}
			return { type: 'Unknown', name, extra: null }
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

const toCategoryString = (row: SQLiteTransaction): string => {
	if (row.categories.length === 0) return ''
	const category = row.categories[0]
	if (category.parentName) return `${category.parentName} > ${category.name}`
	return category.name
}

const isRefundEntity = (entityId: number): boolean => {
	return entityId === SQLITE_ENTITY_ID.RefundTransaction
}

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
	const tags = row.tags.flatMap((tag) => parseTag(tag.name))
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

	const debt = classifyDebtCategory(base, payee, category)
	if (debt) return debt

	const reconcile = classifyReconcile(row, base, payee)
	if (reconcile) return reconcile

	const transfer = classifyTransferEntity(row, base, {
		payee,
		hasCategory,
		category,
		amount: amount.value,
		toAccount,
	})
	if (transfer) return transfer

	if (isRefundEntity(row.entityId)) {
		return {
			...base,
			type: 'Refund',
			payee,
			category,
			checkNumber: CHECK_NUMBER,
		} as ParsedRefundTransaction
	}

	const investment = classifyInvestmentEntity(row, base, payee)
	if (investment) return investment

	const investmentFallback = classifyInvestmentFallback(base, {
		accountType: account.type,
		hasCategory,
		amount: amount.value,
		payee,
	})
	if (investmentFallback) return investmentFallback

	return classifyIncomeExpenseFallback(base, {
		amount: amount.value,
		category,
		hasCategory,
		payee,
	})
}
