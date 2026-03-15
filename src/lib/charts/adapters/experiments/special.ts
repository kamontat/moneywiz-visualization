import type { ChartConfiguration } from 'chart.js'
import type {
	DebtMonthPoint,
	GiveawayPoint,
	WindfallGiveawayPoint,
	WindfallPoint,
} from '$lib/app/dashboard'
import { getThemeColors, withAlpha } from '$lib/charts/theme'

export const toDebtData = (
	points: DebtMonthPoint[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: points.map((point) => point.label),
		datasets: [
			{
				label: 'Debt Taken',
				data: points.map((point) => point.taken),
				backgroundColor: withAlpha(colors.error, 0.67, '#ef4444'),
			},
			{
				label: 'Repaid',
				data: points.map((point) => -point.repaid),
				backgroundColor: withAlpha(colors.success, 0.67, '#22c55e'),
			},
		],
	}
}

export const toWindfallGiveawayData = (
	points: WindfallGiveawayPoint[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: points.map((point) => point.label),
		datasets: [
			{
				label: 'Windfall',
				data: points.map((point) => point.windfall),
				backgroundColor: withAlpha(colors.info, 0.67, '#3b82f6'),
			},
			{
				label: 'Giveaway',
				data: points.map((point) => -point.giveaway),
				backgroundColor: withAlpha(colors.secondary, 0.67, '#a855f7'),
			},
		],
	}
}

export const toWindfallData = (
	points: WindfallPoint[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: points.map((point) => point.label),
		datasets: [
			{
				label: 'Windfall',
				data: points.map((point) => point.windfall),
				backgroundColor: withAlpha(colors.info, 0.67, '#3b82f6'),
			},
			{
				label: 'Regular Income',
				data: points.map((point) => point.regularIncome),
				backgroundColor: withAlpha(colors.success, 0.4, '#22c55e'),
			},
		],
	}
}

export const toGiveawayData = (
	points: GiveawayPoint[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: points.map((point) => point.label),
		datasets: [
			{
				label: 'Giveaway',
				data: points.map((point) => point.giveaway),
				backgroundColor: withAlpha(colors.secondary, 0.67, '#a855f7'),
			},
			{
				label: 'Regular Expense',
				data: points.map((point) => point.regularExpense),
				backgroundColor: withAlpha(colors.error, 0.4, '#ef4444'),
			},
		],
	}
}
