import type { ParsedTransaction } from '$lib/transactions/models'

export interface FxUnresolvedItem {
	transactionId?: number
	currency: string
	date: string
}

export interface FxConversionSummary {
	total: number
	convertedCount: number
	exactCount: number
	estimatedCount: number
	unresolvedCount: number
	unresolvedByCurrency: Record<string, number>
}

export interface FxConversionResult {
	transactions: ParsedTransaction[]
	unresolved: FxUnresolvedItem[]
	summary: FxConversionSummary
}
