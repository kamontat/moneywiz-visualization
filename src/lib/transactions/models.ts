export interface ParsedAmount {
	value: number
	currency: string
	format?: Intl.NumberFormatOptions
}

export type ParsedAccountType =
	| 'Wallet'
	| 'OnlineWallet'
	| 'Checking'
	| 'CreditCard'
	| 'DebitCard'
	| 'Investment'
	| 'Cryptocurrency'
	| 'Loan'
	| 'Unknown'

export interface ParsedAccount {
	type: ParsedAccountType
	name: string
	extra: string | null
}

export interface ParsedCategory {
	category: string
	subcategory: string
}

export interface ParsedTag {
	category: string
	name: string
}

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
	category: ParsedCategory | null
	checkNumber: string
}

export interface ParsedRefundTransaction extends ParsedBaseTransaction {
	type: 'Refund'
	payee: string
	category: ParsedCategory | null
	checkNumber: string
}

export interface ParsedIncomeTransaction extends ParsedBaseTransaction {
	type: 'Income'
	payee: string
	category: ParsedCategory | null
	checkNumber: string
}

export interface ParsedTransferTransaction extends ParsedBaseTransaction {
	type: 'Transfer'
	transfer: ParsedAccount
}

export interface ParsedUnknownTransaction extends ParsedBaseTransaction {
	type: 'Unknown'
}

export type ParsedTransaction =
	| ParsedExpenseTransaction
	| ParsedRefundTransaction
	| ParsedIncomeTransaction
	| ParsedTransferTransaction
	| ParsedUnknownTransaction

export type ParsedTransactionType = ParsedTransaction['type']
