import type { ChartConfiguration } from 'chart.js'
import type { PayeeCashFlowEntry } from '$lib/analytics/transforms/models'
import { getThemeColors, withAlpha } from '$lib/charts/theme'

export const toPayeeDebtData = (
	entries: PayeeCashFlowEntry[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()
	const sorted = entries
		.filter((entry) => entry.debt > 0 || entry.debtRepayment > 0)
		.sort((left, right) => right.debt - left.debt)

	return {
		labels: sorted.map((entry) => entry.payee),
		datasets: [
			{
				label: 'Debt Taken',
				data: sorted.map((entry) => entry.debt),
				backgroundColor: withAlpha(colors.error, 0.67, '#ef4444'),
			},
			{
				label: 'Repaid',
				data: sorted.map((entry) => entry.debtRepayment),
				backgroundColor: withAlpha(colors.success, 0.67, '#22c55e'),
			},
		],
	}
}

export const toPayeeWindfallData = (
	entries: PayeeCashFlowEntry[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()
	const sorted = entries
		.filter((entry) => entry.windfall > 0)
		.sort((left, right) => right.windfall - left.windfall)

	return {
		labels: sorted.map((entry) => entry.payee),
		datasets: [
			{
				label: 'Windfall',
				data: sorted.map((entry) => entry.windfall),
				backgroundColor: withAlpha(colors.info, 0.67, '#3b82f6'),
			},
		],
	}
}

export const toPayeeGiveawayData = (
	entries: PayeeCashFlowEntry[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()
	const sorted = entries
		.filter((entry) => entry.giveaway > 0)
		.sort((left, right) => right.giveaway - left.giveaway)

	return {
		labels: sorted.map((entry) => entry.payee),
		datasets: [
			{
				label: 'Giveaway',
				data: sorted.map((entry) => entry.giveaway),
				backgroundColor: withAlpha(colors.secondary, 0.67, '#a855f7'),
			},
		],
	}
}
