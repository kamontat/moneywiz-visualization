export interface TimeSeriesPoint {
	date: Date
	income: number
	grossExpense: number
	refund: number
	netExpense: number
	remaining: number
	label: string
}

export type TimeSeriesMode = 'Daily' | 'Monthly'

export interface TimeSeries {
	mode: TimeSeriesMode
	points: TimeSeriesPoint[]
}
