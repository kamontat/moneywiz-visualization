import type { ParsedAccount } from './account'
import type { ParsedAmount } from './amount'
import type { ParsedCategory } from './category'
import type { ParsedTag } from './tag'

export interface ParsedBaseTransaction {
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

export interface ParsedTransferTransaction extends ParsedBaseTransaction {
	type: 'Transfer'
	transfer: ParsedAccount
}

export interface ParsedUnknownTransaction extends ParsedBaseTransaction {
	type: 'Unknown'
}
