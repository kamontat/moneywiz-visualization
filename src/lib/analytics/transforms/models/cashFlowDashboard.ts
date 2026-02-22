import type { CategoryTotal } from './categoryTotal'
import type { WaterfallStep } from './experiments'
import type { StatsCurrencyMeta, StatsRange, StatsTrend } from './stats'
import type { TimeSeries } from './timeSeries'
import type { ParsedTransactionType } from '$lib/transactions/models'

export interface CashFlowDelta {
	current: number
	baseline: number | null
	delta: number | null
	deltaPct: number | null
	trend: StatsTrend
}

export type CashFlowKpiDirection = 'higher' | 'lower'

export type CashFlowKpiId =
	| 'netCashFlow'
	| 'savingsRate'
	| 'dailyIncome'
	| 'dailyExpense'

export interface CashFlowKpi {
	id: CashFlowKpiId
	label: string
	unit: 'currency' | 'percent'
	value: number
	delta: CashFlowDelta
	betterWhen: CashFlowKpiDirection
}

export interface CashFlowDashboard {
	currentRange: StatsRange
	baselineRange: StatsRange | null
	transactionCount: number
	baselineTransactionCount: number
	currency: StatsCurrencyMeta
	kpis: CashFlowKpi[]
	trend: TimeSeries
	decomposition: WaterfallStep[]
	categoryDrivers: Record<ParsedTransactionType, CategoryTotal>
}

export interface CashFlowDashboardOptions {
	currentRange?: StatsRange
	baselineRange?: StatsRange | null
}
