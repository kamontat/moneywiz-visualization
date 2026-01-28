export type ParsedAccountType =
	| 'Wallet'
	| 'Checking'
	| 'CreditCard'
	| 'DebitCard'
	| 'Investment'
	| 'Cryptocurrency'
	| 'Loan'
	| 'Unknown'

export interface ParsedAmount {
	value: number
	currency: string
}

export interface ParsedAccount {
	type: ParsedAccountType
}

export interface ParsedCategory {
	id: string
}

export interface ParsedTag {
	id: string
}

export interface ParsedTransaction {
	id: string
}
