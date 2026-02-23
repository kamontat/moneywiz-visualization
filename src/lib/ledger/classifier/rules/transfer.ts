import type {
	ParsedAccount,
	ParsedBaseTransaction,
	ParsedCategory,
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedTransferTransaction,
	ParsedUnknownTransaction,
} from '$lib/ledger/models'
import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import { SQLITE_ENTITY_ID } from '$lib/source/sqlite/models'
import { isIncomeCategory } from '$lib/transactions/utils'

const CHECK_NUMBER = ''

const isTransferEntity = (entityId: number): boolean => {
	return (
		entityId === SQLITE_ENTITY_ID.TransferDepositTransaction ||
		entityId === SQLITE_ENTITY_ID.TransferWithdrawTransaction ||
		entityId === SQLITE_ENTITY_ID.TransferBudgetTransaction
	)
}

export const classifyTransferEntity = (
	row: SQLiteTransaction,
	base: ParsedBaseTransaction,
	input: {
		payee: string
		hasCategory: boolean
		category: ParsedCategory
		amount: number
		toAccount: (ref: SQLiteTransaction['account']) => ParsedAccount
	}
):
	| ParsedIncomeTransaction
	| ParsedExpenseTransaction
	| ParsedRefundTransaction
	| ParsedTransferTransaction
	| ParsedUnknownTransaction
	| undefined => {
	if (!isTransferEntity(row.entityId)) return undefined

	if (input.hasCategory) {
		if (input.amount > 0 && isIncomeCategory(input.category)) {
			return {
				...base,
				type: 'Income',
				payee: input.payee,
				category: input.category,
				checkNumber: CHECK_NUMBER,
			} as ParsedIncomeTransaction
		}

		if (input.amount < 0) {
			return {
				...base,
				type: 'Expense',
				payee: input.payee,
				category: input.category,
				checkNumber: CHECK_NUMBER,
			} as ParsedExpenseTransaction
		}

		if (isIncomeCategory(input.category)) {
			return {
				...base,
				type: 'Unknown',
			} as ParsedUnknownTransaction
		}

		return {
			...base,
			type: 'Refund',
			payee: input.payee,
			category: input.category,
			checkNumber: CHECK_NUMBER,
		} as ParsedRefundTransaction
	}

	const transferAccount = row.recipientAccount ?? row.senderAccount
	return {
		...base,
		type: 'Transfer',
		transfer: input.toAccount(transferAccount),
	} as ParsedTransferTransaction
}
