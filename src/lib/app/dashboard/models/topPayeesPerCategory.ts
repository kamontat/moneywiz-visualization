import type { ParsedTransactionType } from '$lib/transactions/models'

export interface TopPayeeEntry {
	payee: string
	amount: number
	transactionCount: number
	share: number
}

export interface TopPayeesCategoryGroup {
	category: string
	type: ParsedTransactionType
	totalAmount: number
	topPayees: TopPayeeEntry[]
}

export interface TopPayeesPerCategoryResult {
	groups: TopPayeesCategoryGroup[]
	topN: number
	transactionType: ParsedTransactionType
}
