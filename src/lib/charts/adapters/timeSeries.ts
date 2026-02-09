import type { ChartConfiguration, ChartData } from 'chart.js'
import type { TimeSeries } from '$lib/analytics/transforms/models'
import { getThemeColors } from '../theme'

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
				backgroundColor: colors.success + '20',
				tension: 0.3,
				fill: true,
			},
			{
				label: 'Expenses',
				data: data.points.map((p) => p.netExpense),
				borderColor: colors.error,
				backgroundColor: colors.error + '20',
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
				backgroundColor: colors.primary + '20',
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
				backgroundColor: colors.success + '80',
				borderColor: colors.success,
				borderWidth: 1,
				order: 2,
			},
			{
				type: 'bar' as const,
				label: 'Expenses',
				data: data.points.map((p) => p.netExpense),
				backgroundColor: colors.error + '80',
				borderColor: colors.error,
				borderWidth: 1,
				order: 2,
			},
			{
				type: 'line' as const,
				label: 'Difference',
				data: data.points.map((p) => p.income - p.netExpense),
				borderColor: colors.info,
				backgroundColor: colors.info + '20',
				borderWidth: 2,
				tension: 0.3,
				fill: false,
				pointRadius: 3,
				order: 1,
			},
		],
	}
}
