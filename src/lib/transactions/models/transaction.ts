import type { ParsedAccount } from './account'
import type { ParsedAmount } from './amount'
import type { ParsedCategory } from './category'
import type { ParsedTag } from './tag'

export interface ParsedBaseTransaction {
	/** Auto-generated ID (assigned by IndexedDB autoIncrement) */
	id?: number
	account: ParsedAccount
	description: string
	amount: ParsedAmount
	date: Date
	memo: string
	tags: ParsedTag[]
	raw: Record<string, string>
}

export interface ParsedExpenseTransaction extends ParsedBaseTransaction {
	type: 'Expense'
	payee: string
	category: ParsedCategory
	checkNumber: string
}

export interface ParsedRefundTransaction extends ParsedBaseTransaction {
	type: 'Refund'
	payee: string
	category: ParsedCategory
	checkNumber: string
}

export interface ParsedIncomeTransaction extends ParsedBaseTransaction {
	type: 'Income'
	payee: string
	category: ParsedCategory
	checkNumber: string
}

/**
 * Pure Transfer: Transfers field populated AND no Category
 * These are excluded from analysis (moving money between accounts)
 */
export interface ParsedTransferTransaction extends ParsedBaseTransaction {
	type: 'Transfer'
	transfer: ParsedAccount
}

/**
 * Categorized Transfer: Transfers field populated AND has Category
 * Treated as real expense/income (e.g., paying credit card bill categorized as "Bills")
 */
export interface ParsedCategorizedTransferTransaction extends ParsedBaseTransaction {
	type: 'CategorizedTransfer'
	transfer: ParsedAccount
	payee: string
	category: ParsedCategory
	checkNumber: string
}

export interface ParsedUnknownTransaction extends ParsedBaseTransaction {
	type: 'Unknown'
}
