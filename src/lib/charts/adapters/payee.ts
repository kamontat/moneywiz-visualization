import type { ChartData } from 'chart.js'
import type {
	PayeeSpendSeries,
	PayeeSpendTotal,
} from '$lib/analytics/transforms/models'
import { getThemeColors, withAlpha } from '../theme'

export const toPayeeSpendBarData = (
	topPayees: PayeeSpendTotal[]
): ChartData<'bar'> => {
	const colors = getThemeColors()

	return {
		labels: topPayees.map((payee) => payee.payee),
		datasets: [
			{
				label: 'Net Spend',
				data: topPayees.map((payee) => payee.netSpend),
				backgroundColor: withAlpha(colors.error, 0.56, '#ef4444'),
				borderColor: colors.error,
				borderWidth: 1,
			},
		],
	}
}

export const toPayeeSpendTrendData = (
	series: PayeeSpendSeries | undefined
): ChartData<'line'> => {
	const colors = getThemeColors()

	if (!series) {
		return {
			labels: [],
			datasets: [],
		}
	}

	return {
		labels: series.points.map((point) => point.label),
		datasets: [
			{
				label: 'Net Spend',
				data: series.points.map((point) => point.netSpend),
				borderColor: colors.warning,
				backgroundColor: withAlpha(colors.warning, 0.16, '#f59e0b'),
				tension: 0.25,
				fill: true,
			},
		],
	}
}
