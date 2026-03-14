import type { CategoryVolatilityPoint } from './experiments'

export interface StatsRange {
	start: Date
	end: Date
	days: number
	label: string
}

export type StatsTrend = 'up' | 'down' | 'flat' | 'na'

export interface StatsDelta {
	current: number
	baseline: number | null
	delta: number | null
	deltaPct: number | null
	trend: StatsTrend
}

export type StatsDeltaDirection = 'higher' | 'lower' | 'neutral'

export interface StatsKpiItem {
	id: string
	label: string
	unit: 'currency' | 'percent' | 'number'
	value: number
	delta: StatsDelta
	betterWhen: StatsDeltaDirection
}

export interface StatsDeltaMetric {
	id: string
	label: string
	delta: StatsDelta
	betterWhen: StatsDeltaDirection
}

export interface StatsFlowMixItem {
	id: string
	label: string
	amount: number
	share: number
}

export interface StatsConcentrationItem {
	name: string
	amount: number
	share: number
}

export interface StatsConcentration {
	topCategories: StatsConcentrationItem[]
	topPayees: StatsConcentrationItem[]
	categoryHhi: number
	payeeHhi: number
}

export interface StatsRisk {
	regimeCounts: {
		stable: number
		stressed: number
		deficit: number
	}
	outlierDays: number
	totalDays: number
	outlierDayRate: number
	topVolatileCategories: CategoryVolatilityPoint[]
}

export interface StatsWeekdaySpend {
	weekday: string
	amount: number
	share: number
}

export interface StatsCadence {
	activeDays: number
	noSpendDays: number
	avgTransactionsPerActiveDay: number
	weekdaySpend: StatsWeekdaySpend[]
	uncategorizedRate: number
	unknownPayeeRate: number
}

export interface StatsCurrencyMeta {
	primaryCurrency: string
	mixedCurrency: boolean
	counts: Record<string, number>
}

export interface StatsDashboard {
	currentRange: StatsRange
	baselineRange: StatsRange | null
	transactionCount: number
	baselineTransactionCount: number
	currency: StatsCurrencyMeta
	kpis: StatsKpiItem[]
	comparison: StatsDeltaMetric[]
	flowMix: StatsFlowMixItem[]
	concentration: StatsConcentration
	risk: StatsRisk
	cadence: StatsCadence
}

export interface StatsDashboardOptions {
	currentRange?: StatsRange
	baselineRange?: StatsRange | null
	topCategoryLimit?: number
	topPayeeLimit?: number
	volatilityLimit?: number
}
