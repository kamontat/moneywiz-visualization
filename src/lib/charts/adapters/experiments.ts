import type { ChartConfiguration } from 'chart.js'
import type {
	CalendarCell,
	CategoryBubblePoint,
	CategoryVolatilityPoint,
	CumulativeSavingsPoint,
	OutlierPoint,
	RefundImpactPoint,
	RegimeSegment,
	WaterfallStep,
} from '$lib/analytics/transforms/models'
import { getCategoryPalette, getThemeColors, withAlpha } from '../theme'

export const toMonthlyWaterfallData = (
	steps: WaterfallStep[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: steps.map((step) => step.label),
		datasets: [
			{
				label: 'Income',
				data: steps.map((step) => step.income),
				backgroundColor: withAlpha(colors.success, 0.56, '#22c55e'),
				stack: 'flow',
			},
			{
				label: 'Expense',
				data: steps.map((step) => -step.expense),
				backgroundColor: withAlpha(colors.error, 0.56, '#ef4444'),
				stack: 'flow',
			},
			{
				label: 'Debt',
				data: steps.map((step) => -step.debt),
				backgroundColor: withAlpha(colors.warning, 0.56, '#f59e0b'),
				stack: 'flow',
			},
			{
				label: 'Buy/Sell',
				data: steps.map((step) => step.buySell),
				backgroundColor: withAlpha(colors.secondary, 0.56, '#a855f7'),
				stack: 'flow',
			},
			{
				type: 'line' as const,
				label: 'End Balance',
				data: steps.map((step) => step.endBalance),
				borderColor: colors.info,
				backgroundColor: withAlpha(colors.info, 0.125, '#3b82f6'),
				pointRadius: 2,
				tension: 0.2,
			},
		],
	}
}

export const toCalendarHeatmapData = (
	cells: CalendarCell[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		datasets: [
			{
				label: 'Daily Net Flow',
				data: cells,
				parsing: {
					xAxisKey: 'x',
					yAxisKey: 'y',
				},
				backgroundColor: (ctx: { raw?: unknown }) => {
					const raw = ctx.raw as CalendarCell | undefined
					if (!raw) return withAlpha(colors.neutral, 0.125, '#6b7280')
					if (raw.value === 0) {
						return withAlpha(colors.neutral, 0.21, '#6b7280')
					}
					if (raw.value < 0) {
						const errorAlphas = [0.125, 0.21, 0.31, 0.44, 0.56]
						return withAlpha(
							colors.error,
							errorAlphas[raw.bucket] ?? 0.125,
							'#ef4444'
						)
					}
					const successAlphas = [0.125, 0.21, 0.31, 0.44, 0.56]
					return withAlpha(
						colors.success,
						successAlphas[raw.bucket] ?? 0.125,
						'#22c55e'
					)
				},
				borderColor: withAlpha(colors.baseContentMuted, 0.19, '#1f2937'),
				borderWidth: 1,
				width: ({ chart }: { chart?: { chartArea?: { width?: number } } }) => {
					const width = chart?.chartArea?.width ?? 700
					return width / 56
				},
				height: 12,
			},
		],
	}
}

export const toCategoryVolatilityData = (
	points: CategoryVolatilityPoint[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		datasets: [
			{
				label: 'Volatility',
				data: points.map((point) => ({
					x: point.mean,
					y: point.stddev,
					category: point.category,
				})),
				pointRadius: 5,
				pointHoverRadius: 7,
				backgroundColor: withAlpha(colors.warning, 0.67, '#f59e0b'),
				borderColor: colors.warning,
			},
		],
	}
}

export const toCategoryBubbleData = (
	points: CategoryBubblePoint[]
): ChartConfiguration['data'] => {
	const palette = getCategoryPalette(points.length)

	return {
		datasets: [
			{
				label: 'Categories',
				data: points.map((point) => ({
					x: point.count,
					y: point.total,
					r: Math.max(4, Math.min(24, point.avgTicket / 150)),
					category: point.category,
				})),
				backgroundColor: points.map((_, index) =>
					withAlpha(palette[index], 0.67, '#6366f1')
				),
			},
		],
	}
}

export const toCumulativeSavingsData = (
	points: CumulativeSavingsPoint[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: points.map((point) => point.label),
		datasets: [
			{
				type: 'line' as const,
				label: 'Cumulative Savings',
				data: points.map((point) => point.cumulative),
				borderColor: colors.success,
				backgroundColor: withAlpha(colors.success, 0.125, '#22c55e'),
				tension: 0.2,
			},
			{
				type: 'line' as const,
				label: 'Target',
				data: points.map((point) => point.target),
				borderColor: colors.info,
				borderDash: [6, 6],
				pointRadius: 0,
				tension: 0,
			},
		],
	}
}

export const toRefundImpactData = (
	points: RefundImpactPoint[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: points.map((point) => point.label),
		datasets: [
			{
				label: 'Gross Expense',
				data: points.map((point) => point.grossExpense),
				backgroundColor: withAlpha(colors.error, 0.5, '#ef4444'),
			},
			{
				label: 'Refund',
				data: points.map((point) => point.refund),
				backgroundColor: withAlpha(colors.success, 0.5, '#22c55e'),
			},
			{
				label: 'Net Expense',
				data: points.map((point) => point.netExpense),
				backgroundColor: withAlpha(colors.warning, 0.5, '#f59e0b'),
			},
		],
	}
}

export const toRegimeTimelineData = (
	segments: RegimeSegment[]
): ChartConfiguration['data'] => {
	return {
		labels: segments.map((segment) => segment.label),
		datasets: [
			{
				label: 'Regime',
				data: segments.map((segment) => segment.ratio * 100),
				backgroundColor: segments.map((segment) => {
					switch (segment.regime) {
						case 'Stable':
							return '#22c55ecc'
						case 'Stressed':
							return '#f59e0bcc'
						case 'Deficit':
							return '#ef4444cc'
					}
				}),
			},
		],
	}
}

export const toOutlierTimelineData = (
	points: OutlierPoint[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		labels: points.map((point) => point.label),
		datasets: [
			{
				type: 'line' as const,
				label: 'Daily Magnitude',
				data: points.map((point) => point.value),
				borderColor: colors.primary,
				backgroundColor: withAlpha(colors.primary, 0.125, '#6366f1'),
				tension: 0.2,
			},
			{
				type: 'line' as const,
				label: 'Baseline',
				data: points.map((point) => point.baseline),
				borderColor: colors.neutral,
				borderDash: [4, 4],
				pointRadius: 0,
			},
			{
				type: 'scatter' as const,
				label: 'Outliers',
				data: points
					.map((point, index) => ({ x: index, y: point.value, point }))
					.filter((item) => item.point.isOutlier),
				backgroundColor: colors.error,
				pointRadius: 5,
			},
		],
	}
}
