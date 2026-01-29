import type { AnalyticFunc } from '../models'

export interface SummaryDateRange {
	start: Date
	end: Date
}

export interface Summary {
	totalIncome: number
	totalExpenses: number
	netTotal: number
	transactionCount: number
	savingRate: number
	dateRange: SummaryDateRange
}

export const calSummary: AnalyticFunc<Summary> = () => {
	// TODO: implement summary calculation
	return {} as Summary
}
