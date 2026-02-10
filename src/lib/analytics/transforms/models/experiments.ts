export interface FlowLink {
	from: string
	to: string
	flow: number
}

export interface WaterfallStep {
	label: string
	income: number
	expense: number
	debt: number
	buySell: number
	net: number
	startBalance: number
	endBalance: number
}

export interface CalendarCell {
	x: number
	y: number
	day: string
	value: number
	bucket: number
}

export interface CategoryVolatilityPoint {
	category: string
	mean: number
	stddev: number
	cov: number
	months: number
}

export interface CategoryBubblePoint {
	category: string
	total: number
	count: number
	avgTicket: number
}

export interface CumulativeSavingsPoint {
	label: string
	net: number
	cumulative: number
	target: number
}

export interface TreemapNode {
	name: string
	path: string[]
	value: number
}

export interface RefundImpactPoint {
	label: string
	grossExpense: number
	refund: number
	netExpense: number
}

export type RegimeType = 'Stable' | 'Stressed' | 'Deficit'

export interface RegimeSegment {
	label: string
	income: number
	netCashFlow: number
	ratio: number
	regime: RegimeType
}

export interface OutlierPoint {
	label: string
	value: number
	baseline: number
	zScore: number
	isOutlier: boolean
}
