export interface SummarizeDateRange {
	start: Date
	end: Date
}

export interface Summarize {
	totalIncome: number
	totalExpenses: number
	netTotal: number
	transactionCount: number
	savingRate: number
	dateRange: SummarizeDateRange
}
