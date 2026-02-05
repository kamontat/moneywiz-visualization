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
