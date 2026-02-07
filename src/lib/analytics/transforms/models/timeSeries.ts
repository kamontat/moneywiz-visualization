export interface TimeSeriesPoint {
	date: Date
	income: number
	expense: number
	net: number
	label: string
}

export type TimeSeriesMode = 'Daily' | 'Monthly'

export interface TimeSeries {
	mode: TimeSeriesMode
	points: TimeSeriesPoint[]
}
