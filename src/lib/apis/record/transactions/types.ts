import type { DataRecord } from '$lib/types/index.js'

export type TransactionType =
	| 'income'
	| 'expense'
	| 'refund'
	| 'windfall'
	| 'giveaway'
	| 'debt'
	| 'debt_repayment'
	| 'transfer'
	| 'reconcile'
	| 'buy'
	| 'sell'
	| 'unknown'

export interface DataBaseTransaction {
	readonly id: number
	readonly date: Date
	readonly amount: number
	readonly currency: string
	readonly category: string
	readonly subcategory: string
	readonly payee: string
	readonly accountId: number
	readonly accountName: string
	readonly notes: string
	readonly tags: ReadonlyArray<{ category: string; name: string }>
}

export interface DataIncomeTransaction extends DataBaseTransaction {
	readonly type: 'income'
}

export interface DataExpenseTransaction extends DataBaseTransaction {
	readonly type: 'expense'
}

export interface DataRefundTransaction extends DataBaseTransaction {
	readonly type: 'refund'
}

export interface DataWindfallTransaction extends DataBaseTransaction {
	readonly type: 'windfall'
}

export interface DataGiveawayTransaction extends DataBaseTransaction {
	readonly type: 'giveaway'
}

export interface DataDebtTransaction extends DataBaseTransaction {
	readonly type: 'debt'
}

export interface DataDebtRepaymentTransaction extends DataBaseTransaction {
	readonly type: 'debt_repayment'
}

export interface DataTransferTransaction extends DataBaseTransaction {
	readonly type: 'transfer'
}

export interface DataReconcileTransaction extends DataBaseTransaction {
	readonly type: 'reconcile'
}

export interface DataBuyTransaction extends DataBaseTransaction {
	readonly type: 'buy'
}

export interface DataSellTransaction extends DataBaseTransaction {
	readonly type: 'sell'
}

export interface DataUnknownTransaction extends DataBaseTransaction {
	readonly type: 'unknown'
}

export type DataTransaction =
	| DataIncomeTransaction
	| DataExpenseTransaction
	| DataRefundTransaction
	| DataWindfallTransaction
	| DataGiveawayTransaction
	| DataDebtTransaction
	| DataDebtRepaymentTransaction
	| DataTransferTransaction
	| DataReconcileTransaction
	| DataBuyTransaction
	| DataSellTransaction
	| DataUnknownTransaction

export interface DataTransactions extends DataRecord {
	readonly name: 'transactions'
	readonly type: 'record'
	readonly transactions: readonly DataTransaction[]
}
