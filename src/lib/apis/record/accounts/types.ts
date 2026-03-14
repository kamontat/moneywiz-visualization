import type { DataRecord } from '$lib/types/index.js'

export type AccountType =
	| 'wallet'
	| 'checking'
	| 'creditcard'
	| 'loan'
	| 'investment'
	| 'unknown'

export interface DataBaseAccount {
	readonly id: number
	readonly name: string
	readonly currency: string
}

export interface DataWalletAccount extends DataBaseAccount {
	readonly type: 'wallet'
}

export interface DataCheckingAccount extends DataBaseAccount {
	readonly type: 'checking'
}

export interface DataCreditCardAccount extends DataBaseAccount {
	readonly type: 'creditcard'
}

export interface DataLoanAccount extends DataBaseAccount {
	readonly type: 'loan'
}

export interface DataInvestmentAccount extends DataBaseAccount {
	readonly type: 'investment'
}

export interface DataUnknownAccount extends DataBaseAccount {
	readonly type: 'unknown'
}

export type DataAccount =
	| DataWalletAccount
	| DataCheckingAccount
	| DataCreditCardAccount
	| DataLoanAccount
	| DataInvestmentAccount
	| DataUnknownAccount

export interface DataAccounts extends DataRecord {
	readonly name: 'accounts'
	readonly type: 'record'
	readonly accounts: readonly DataAccount[]
}
