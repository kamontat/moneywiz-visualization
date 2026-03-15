import type { CashFlowDashboard, NetWorthSummary, StatsRange } from './types'
import type {
	ParsedTransaction,
	ParsedTransactionType,
} from '$lib/transactions/models'
import {
	byCategoryBubble,
	byCategoryVolatility,
	byCalendarHeatmap,
	byCashFlowDashboard,
	byCategoryTotal,
	byCategoryTree,
	byCumulativeSavings,
	byMonthlyWaterfall,
	byOutlierTimeline,
	byPayeeSpend,
	byRefundImpact,
	byRegimeTimeline,
	byStatsDashboard,
	byTopPayeesPerCategory,
	toNetWorthSummary,
	transform,
} from './transforms'

export interface OverviewExpenseDriver {
	rank: number
	name: string
	amount: number
	share: number
}

export interface OverviewPanelData {
	netWorth: NetWorthSummary
	topExpenseDrivers: OverviewExpenseDriver[]
}

export function buildOverviewPanelData(
	transactions: ParsedTransaction[],
	netWorthSummary?: NetWorthSummary
): OverviewPanelData {
	const waterfall = transform(transactions, byMonthlyWaterfall)
	const netWorth = netWorthSummary ?? toNetWorthSummary(waterfall)
	const categoryTotals = transform(transactions, byCategoryTotal)
	const entries = Object.entries(categoryTotals.Expense?.parents ?? {})
	const total = entries.reduce(
		(sum, [, parent]) => sum + Math.abs(parent.total),
		0
	)

	const topExpenseDrivers = entries
		.sort(([, left], [, right]) => Math.abs(right.total) - Math.abs(left.total))
		.slice(0, 5)
		.map(([name, parent], index) => {
			const amount = Math.abs(parent.total)
			return {
				rank: index + 1,
				name,
				amount,
				share: total === 0 ? 0 : (amount / total) * 100,
			}
		})

	return { netWorth, topExpenseDrivers }
}

export function buildCashFlowDashboard(
	transactions: ParsedTransaction[],
	baselineTransactions: ParsedTransaction[] = [],
	currentRange?: StatsRange | null,
	baselineRange?: StatsRange | null
): CashFlowDashboard | undefined {
	if (transactions.length === 0) return undefined

	return transform(
		transactions,
		byCashFlowDashboard(baselineTransactions, {
			currentRange: currentRange ?? undefined,
			baselineRange,
		})
	)
}

export function buildStatsPanelData(
	transactions: ParsedTransaction[],
	baselineTransactions: ParsedTransaction[] = [],
	currentRange?: StatsRange | null,
	baselineRange?: StatsRange | null
) {
	const stats =
		transactions.length === 0
			? undefined
			: transform(
					transactions,
					byStatsDashboard(baselineTransactions, {
						currentRange: currentRange ?? undefined,
						baselineRange,
						volatilityLimit: 5,
					})
				)

	const calendarCells = transform(transactions, byCalendarHeatmap)

	return { stats, calendarCells }
}

export function buildDriversPanelData(
	transactions: ParsedTransaction[],
	topPayeesType: ParsedTransactionType,
	topN: number
) {
	const expenseTree = transform(transactions, byCategoryTree('Expense'))
	const incomeTree = transform(transactions, byCategoryTree('Income'))
	const categoryTotals = transform(transactions, byCategoryTotal)
	const payeeSpend = transform(transactions, byPayeeSpend(20))
	const topPayeesResult = transform(
		transactions,
		byTopPayeesPerCategory(topPayeesType, topN)
	)

	const categoryParents = Object.entries(categoryTotals.Expense?.parents ?? {})
	const total = categoryParents.reduce(
		(sum, [, entry]) => sum + Math.abs(entry.total),
		0
	)
	const topCategories = categoryParents
		.sort(([, left], [, right]) => Math.abs(right.total) - Math.abs(left.total))
		.slice(0, 8)
		.map(([name, entry]) => {
			const amount = Math.abs(entry.total)
			return {
				name,
				amount,
				share: total === 0 ? 0 : (amount / total) * 100,
			}
		})
	const hhi = categoryParents.reduce((sum, [, entry]) => {
		const amount = Math.abs(entry.total)
		const share = total === 0 ? 0 : amount / total
		return sum + share * share
	}, 0)

	return {
		expenseTree,
		incomeTree,
		categoryTotals,
		payeeSpend,
		topPayeesResult,
		concentration: {
			topCategories,
			hhi,
		},
	}
}

export function buildExperimentsPanelData(
	transactions: ParsedTransaction[],
	monthlyTarget: number
) {
	return {
		volatility: transform(transactions, byCategoryVolatility),
		bubbles: transform(transactions, byCategoryBubble),
		refundImpact: transform(transactions, byRefundImpact),
		regimes: transform(transactions, byRegimeTimeline),
		outliers: transform(transactions, byOutlierTimeline),
		savings: transform(transactions, byCumulativeSavings(monthlyTarget)),
	}
}
