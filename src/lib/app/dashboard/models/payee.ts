import type { TimeSeriesMode } from './timeSeries'

export interface PayeeSpendTotal {
	payee: string
	netSpend: number
	transactionCount: number
	avgTicket: number
}

export interface PayeeSpendPoint {
	date: Date
	label: string
	netSpend: number
	transactionCount: number
}

export interface PayeeSpendSeries {
	mode: TimeSeriesMode
	points: PayeeSpendPoint[]
}

export interface PayeeSpendAnalysis {
	topPayees: PayeeSpendTotal[]
	seriesByPayee: Record<string, PayeeSpendSeries>
	uniquePayeeCount: number
	totalNetSpend: number
}
