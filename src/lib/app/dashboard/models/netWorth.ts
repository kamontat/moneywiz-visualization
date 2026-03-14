export interface NetWorthPoint {
	label: string
	netWorth: number
	monthlyChange: number
}

export interface NetWorthSummary {
	points: NetWorthPoint[]
	currentNetWorth: number
	peakNetWorth: number
	peakMonth: string | null
	troughNetWorth: number
	troughMonth: string | null
	latestMonthlyChange: number
	averageMonthlyChange: number
	monthCount: number
}
