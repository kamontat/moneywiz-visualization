export interface SummarizeDateRange {
	start: Date
	end: Date
}

export interface Summarize {
	totalIncome: number
	grossExpenses: number
	totalRefunds: number
	netExpenses: number
	netCashFlow: number
	savingsRate: number
	transactionCount: number
	dateRange: SummarizeDateRange
	totalDebt: number
	totalDebtRepayment: number
	totalWindfall: number
	totalGiveaway: number
}
