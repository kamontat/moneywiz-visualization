export interface LedgerAccountBalanceRow {
	accountId: number
	name: string
	entityId: number
	currency?: string
	isArchived: boolean
	openingBalance: number
}

export interface LedgerNetWorthBaselineMeta {
	version: 1
	generatedAt: string
	accounts: LedgerAccountBalanceRow[]
}
