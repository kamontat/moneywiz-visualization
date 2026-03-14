import type { RawTransaction } from '../querier/types.js'
import type {
	DataTransaction,
	DataTransactions,
	TransactionType,
} from '../types.js'
import type { ClassificationContext, ClassificationRule } from './types.js'
import {
	debtRepaymentRule,
	debtRule,
	expenseRule,
	giveawayRule,
	incomeRule,
	investmentAccountBuyRule,
	investmentAccountSellRule,
	investmentBuyRule,
	investmentSellRule,
	reconcileRule,
	refundFallbackRule,
	refundRule,
	transferNoCategoryRule,
	transferWithCategoryRule,
	unknownRule,
	windfallRule,
} from './rules/priority.js'

const APPLE_REFERENCE_EPOCH_MS = Date.UTC(2001, 0, 1)
const DEFAULT_CURRENCY = 'THB'

const RULES: readonly ClassificationRule[] = [
	debtRule,
	debtRepaymentRule,
	windfallRule,
	giveawayRule,
	reconcileRule,
	transferWithCategoryRule,
	transferNoCategoryRule,
	refundRule,
	investmentBuyRule,
	investmentSellRule,
	investmentAccountSellRule,
	investmentAccountBuyRule,
	incomeRule,
	expenseRule,
	refundFallbackRule,
	unknownRule,
]

function convertDate(timestamp: number | null): Date {
	if (timestamp === null || timestamp === 0) return new Date(0)
	return new Date(APPLE_REFERENCE_EPOCH_MS + timestamp * 1000)
}

function buildContext(raw: RawTransaction): ClassificationContext {
	return {
		raw,
		date: convertDate(raw.date),
		amount: raw.amount ?? 0,
		currency: raw.currency ?? DEFAULT_CURRENCY,
		category: raw.categoryParentName ?? '',
		subcategory: raw.categoryName ?? '',
		payee: raw.payee ?? '',
		accountId: raw.accountId ?? 0,
		accountName: raw.accountName ?? '',
		accountEntityType: raw.accountEntityType,
	}
}

function classifyOne(ctx: ClassificationContext): TransactionType {
	for (const rule of RULES) {
		const result = rule.match(ctx)
		if (result !== null) return result
	}
	return 'unknown'
}

function isNewBalanceNoise(raw: RawTransaction): boolean {
	if (raw.categoryName !== null || raw.categoryParentName !== null) return false
	const notes = raw.notes ?? ''
	return /new balance/i.test(notes)
}

function isIncompleteRecord(
	raw: RawTransaction,
	type: TransactionType
): boolean {
	if (type !== 'income' && type !== 'expense') return false
	const payee = raw.payee ?? ''
	const hasCategory =
		raw.categoryName !== null || raw.categoryParentName !== null
	return payee === '' || !hasCategory
}

export function classifyTransactions(
	rawTransactions: RawTransaction[]
): DataTransactions {
	const transactions: DataTransaction[] = []

	for (const raw of rawTransactions) {
		if (isNewBalanceNoise(raw)) continue

		const ctx = buildContext(raw)
		const type = classifyOne(ctx)

		if (isIncompleteRecord(raw, type)) continue

		transactions.push({
			id: raw.id,
			type,
			date: ctx.date,
			amount: ctx.amount,
			currency: ctx.currency,
			category: ctx.category,
			subcategory: ctx.subcategory,
			payee: ctx.payee,
			accountId: ctx.accountId,
			accountName: ctx.accountName,
			notes: raw.notes ?? '',
			tags: raw.tags,
		} as DataTransaction)
	}

	return {
		name: 'transactions',
		type: 'record',
		transactions,
	}
}
