import type { ParsedAccount } from '$lib/transactions/models/account'
import type { ParsedTag } from '$lib/transactions/models/tag'
import type {
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedTransferTransaction,
	ParsedBuyTransaction,
	ParsedSellTransaction,
	ParsedReconcileTransaction,
	ParsedDebtTransaction,
	ParsedDebtRepaymentTransaction,
	ParsedWindfallTransaction,
	ParsedGiveawayTransaction,
	ParsedUnknownTransaction,
} from '$lib/transactions/models/transaction'
import {
	KCNT_TAG_CATEGORY,
	KCNT_TAG_NAME,
	KCNT_ACCOUNT_MARKER,
} from './constants'

type ParsedTransaction =
	| ParsedExpenseTransaction
	| ParsedIncomeTransaction
	| ParsedRefundTransaction
	| ParsedTransferTransaction
	| ParsedBuyTransaction
	| ParsedSellTransaction
	| ParsedReconcileTransaction
	| ParsedDebtTransaction
	| ParsedDebtRepaymentTransaction
	| ParsedWindfallTransaction
	| ParsedGiveawayTransaction
	| ParsedUnknownTransaction

// Check if tags array contains Group:KcNt tag
export const hasKcNtTag = (tags: ParsedTag[]): boolean =>
	tags.some((t) => t.category === KCNT_TAG_CATEGORY && t.name === KCNT_TAG_NAME)

// Check if account.extra contains 'KcNt'
export const isKcNtAccount = (
	account: ParsedAccount | null | undefined
): boolean => account?.extra?.includes(KCNT_ACCOUNT_MARKER) ?? false

// Check if transaction has KcNt tag
export const isKcNtTransaction = (tx: ParsedTransaction): boolean =>
	hasKcNtTag(tx.tags)

// Check if transfer is between two KcNt accounts (to be excluded)
export const isKcNtToKcNtTransfer = (tx: ParsedTransaction): boolean => {
	if (tx.type !== 'Transfer') return false
	const transferTx = tx as ParsedTransferTransaction
	return isKcNtAccount(transferTx.account) && isKcNtAccount(transferTx.transfer)
}
