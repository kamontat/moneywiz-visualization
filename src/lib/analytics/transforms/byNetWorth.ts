import type { NetWorthPoint, NetWorthSummary, WaterfallStep } from './models'

const emptyNetWorthSummary = (): NetWorthSummary => ({
	points: [],
	currentNetWorth: 0,
	peakNetWorth: 0,
	peakMonth: null,
	troughNetWorth: 0,
	troughMonth: null,
	latestMonthlyChange: 0,
	averageMonthlyChange: 0,
	monthCount: 0,
})

export const toNetWorthSummary = (steps: WaterfallStep[]): NetWorthSummary => {
	if (steps.length === 0) return emptyNetWorthSummary()

	const points: NetWorthPoint[] = steps.map((step) => ({
		label: step.label,
		netWorth: step.endBalance,
		monthlyChange: step.net,
	}))

	let peak = points[0]
	let trough = points[0]
	let monthlyChangeTotal = 0

	for (const point of points) {
		monthlyChangeTotal += point.monthlyChange

		if (point.netWorth > peak.netWorth) {
			peak = point
		}

		if (point.netWorth < trough.netWorth) {
			trough = point
		}
	}

	const latest = points[points.length - 1]

	return {
		points,
		currentNetWorth: latest.netWorth,
		peakNetWorth: peak.netWorth,
		peakMonth: peak.label,
		troughNetWorth: trough.netWorth,
		troughMonth: trough.label,
		latestMonthlyChange: latest.monthlyChange,
		averageMonthlyChange: monthlyChangeTotal / points.length,
		monthCount: points.length,
	}
}
