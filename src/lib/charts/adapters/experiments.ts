import type { ChartConfiguration } from 'chart.js'
import type {
	CalendarCell,
	CategoryBubblePoint,
	CategoryVolatilityPoint,
	CumulativeSavingsPoint,
	FlowLink,
	OutlierPoint,
	RefundImpactPoint,
	RegimeSegment,
	TreemapNode,
	WaterfallStep,
} from '$lib/analytics/transforms/models'
import { getCategoryPalette, getThemeColors } from '../theme'

export const toCashflowSankeyData = (
	links: FlowLink[]
): ChartConfiguration['data'] => {
	const colors = getThemeColors()

	return {
		datasets: [
			{
				label: 'Cash Flow',
				data: links.map((link) => ({
					from: link.from,
					to: link.to,
					flow: link.flow,
				})),
				colorFrom: () => colors.primary,
				colorTo: () => colors.info,
				colorMode: 'gradient',
			},
		],
	}
}

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
				backgroundColor: colors.success + '90',
				stack: 'flow',
			},
			{
				label: 'Expense',
				data: steps.map((step) => -step.expense),
				backgroundColor: colors.error + '90',
				stack: 'flow',
			},
			{
				label: 'Debt',
				data: steps.map((step) => -step.debt),
				backgroundColor: colors.warning + '90',
				stack: 'flow',
			},
			{
				label: 'Buy/Sell',
				data: steps.map((step) => step.buySell),
				backgroundColor: colors.secondary + '90',
				stack: 'flow',
			},
			{
				type: 'line' as const,
				label: 'End Balance',
				data: steps.map((step) => step.endBalance),
				borderColor: colors.info,
				backgroundColor: colors.info + '20',
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
					if (!raw) return colors.neutral + '20'
					if (raw.value < 0) {
						return `${colors.error}${['20', '35', '50', '70', '90'][raw.bucket]}`
					}
					return `${colors.success}${['20', '35', '50', '70', '90'][raw.bucket]}`
				},
				borderColor: colors.baseContentMuted + '30',
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
				backgroundColor: colors.warning + 'aa',
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
				backgroundColor: points.map((_, index) => palette[index] + 'aa'),
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
				backgroundColor: colors.success + '20',
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

export const toTreemapData = (
	nodes: TreemapNode[]
): ChartConfiguration['data'] => {
	const palette = getCategoryPalette(12)
	const colorByParent = new Map<string, string>()

	return {
		datasets: [
			{
				label: 'Category Treemap',
				data: [],
				tree: nodes.map((node) => ({
					value: node.value,
					category: node.path[0],
					subcategory: node.path[1],
				})),
				key: 'value',
				groups: ['category', 'subcategory'],
				borderWidth: 1,
				spacing: 0.5,
				backgroundColor: (ctx: { raw?: unknown }) => {
					const raw = ctx.raw as { _data?: { category?: string } } | undefined
					const category = raw?._data?.category ?? 'Unknown'
					if (!colorByParent.has(category)) {
						const color = palette[colorByParent.size % palette.length]
						colorByParent.set(category, color)
					}
					return colorByParent.get(category) + 'bb'
				},
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
				backgroundColor: colors.error + '80',
			},
			{
				label: 'Refund',
				data: points.map((point) => point.refund),
				backgroundColor: colors.success + '80',
			},
			{
				label: 'Net Expense',
				data: points.map((point) => point.netExpense),
				backgroundColor: colors.warning + '80',
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
				backgroundColor: colors.primary + '20',
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
