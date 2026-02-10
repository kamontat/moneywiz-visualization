import type { ChartConfiguration, ChartData } from 'chart.js'
import type { TimeSeries } from '$lib/analytics/transforms/models'
import { getThemeColors, withAlpha } from '../theme'

export const toIncomeExpenseChartData = (
	data: TimeSeries
): ChartData<'line'> => {
	const colors = getThemeColors()

	return {
		labels: data.points.map((p) => p.label),
		datasets: [
			{
				label: 'Income',
				data: data.points.map((p) => p.income),
				borderColor: colors.success,
				backgroundColor: withAlpha(colors.success, 0.125, '#22c55e'),
				tension: 0.3,
				fill: true,
			},
			{
				label: 'Expenses',
				data: data.points.map((p) => p.netExpense),
				borderColor: colors.error,
				backgroundColor: withAlpha(colors.error, 0.125, '#ef4444'),
				tension: 0.3,
				fill: true,
			},
		],
	}
}

export const toCashFlowTrendChartData = (
	data: TimeSeries
): ChartData<'line'> => {
	const colors = getThemeColors()

	return {
		labels: data.points.map((p) => p.label),
		datasets: [
			{
				label: 'Net Cash Flow',
				data: data.points.map((p) => p.remaining),
				borderColor: colors.primary,
				backgroundColor: withAlpha(colors.primary, 0.125, '#6366f1'),
				tension: 0.4,
				fill: true,
			},
		],
	}
}

export const toIncomeExpenseComparisonChartData = (
	data: TimeSeries
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: data.points.map((p) => p.label),
		datasets: [
			{
				type: 'bar' as const,
				label: 'Income',
				data: data.points.map((p) => p.income),
				backgroundColor: withAlpha(colors.success, 0.5, '#22c55e'),
				borderColor: colors.success,
				borderWidth: 1,
				order: 2,
			},
			{
				type: 'bar' as const,
				label: 'Expenses',
				data: data.points.map((p) => p.netExpense),
				backgroundColor: withAlpha(colors.error, 0.5, '#ef4444'),
				borderColor: colors.error,
				borderWidth: 1,
				order: 2,
			},
			{
				type: 'line' as const,
				label: 'Difference',
				data: data.points.map((p) => p.income - p.netExpense),
				borderColor: colors.info,
				backgroundColor: withAlpha(colors.info, 0.125, '#3b82f6'),
				borderWidth: 2,
				tension: 0.3,
				fill: false,
				pointRadius: 3,
				order: 1,
			},
		],
	}
}
