import type {
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedTransaction,
	ParsedTransferTransaction,
} from '$lib/transactions/models'
import { isKcNtAccount, isKcNtTransaction } from './detection'

export interface ReclassifyOptions {
	kcntModeEnabled: boolean
}

const KCNT_TRANSFER_CATEGORY = {
	category: 'Transfer',
	subcategory: '',
} as const

const reclassifyToExpense = (
	transfer: ParsedTransferTransaction,
	destName: string
): ParsedExpenseTransaction => ({
	...transfer,
	type: 'Expense',
	payee: destName,
	category: KCNT_TRANSFER_CATEGORY,
	checkNumber: '',
})

const reclassifyToIncome = (
	transfer: ParsedTransferTransaction,
	sourceName: string
): ParsedIncomeTransaction => ({
	...transfer,
	type: 'Income',
	payee: sourceName,
	category: KCNT_TRANSFER_CATEGORY,
	checkNumber: '',
})

export const reclassifyForKcNtMode = (
	tx: ParsedTransaction,
	options: ReclassifyOptions
): ParsedTransaction => {
	if (tx.type !== 'Transfer') return tx

	const transfer = tx as ParsedTransferTransaction
	const sourceAccount = transfer.account
	const destAccount = transfer.transfer

	const sourceIsKcNt = isKcNtAccount(sourceAccount)
	const destIsKcNt = isKcNtAccount(destAccount)

	if (options.kcntModeEnabled && !isKcNtTransaction(tx)) return tx

	if (!sourceIsKcNt && !destIsKcNt) return tx

	if (!sourceIsKcNt && destIsKcNt) {
		return reclassifyToExpense(transfer, destAccount?.name ?? 'Unknown')
	}

	if (sourceIsKcNt && !destIsKcNt) {
		return reclassifyToIncome(transfer, sourceAccount?.name ?? 'Unknown')
	}

	return tx
}

export const reclassifyTransactionsForKcNtMode = (
	transactions: ParsedTransaction[],
	options: ReclassifyOptions
): ParsedTransaction[] =>
	transactions.map((tx) => reclassifyForKcNtMode(tx, options))
