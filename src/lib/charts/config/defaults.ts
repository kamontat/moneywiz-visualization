import type { ChartOptions, TooltipItem } from 'chart.js'
import type { CalendarCell } from '$lib/analytics/transforms/models'
import { getThemeColors, withAlpha } from '../theme'

import { formatCurrency } from '$lib/formatters/amount'

const toNumber = (value: unknown): number => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value
	}

	if (typeof value === 'string') {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : 0
	}

	return 0
}

const getDoughnutTooltipLabel = (context: TooltipItem<'doughnut'>): string => {
	const dataset = context.dataset.data
	const value = Math.abs(toNumber(context.raw ?? context.parsed))
	const total = dataset.reduce(
		(sum, datum) => sum + Math.abs(toNumber(datum)),
		0
	)
	const percentage = total > 0 ? (value / total) * 100 : 0
	const label = context.label ? `${context.label}: ` : ''

	return `${label}${formatCurrency(value)} (${percentage.toFixed(1)}%)`
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const getCalendarCell = (raw: unknown): CalendarCell | undefined => {
	if (!raw || typeof raw !== 'object') return undefined
	if (!('day' in raw) || !('value' in raw) || !('y' in raw)) return undefined
	return raw as CalendarCell
}

const themePlugin = () => {
	const colors = getThemeColors()
	return {
		legend: {
			labels: {
				color: colors.baseContent,
			},
		},
		tooltip: {
			mode: 'index' as const,
			intersect: false,
		},
	}
}

const themeScales = () => {
	const colors = getThemeColors()
	return {
		x: {
			ticks: { color: colors.baseContentMuted },
			grid: { color: withAlpha(colors.baseContentMuted, 0.125, '#1f2937') },
		},
		y: {
			beginAtZero: true,
			ticks: { color: colors.baseContentMuted },
			grid: { color: withAlpha(colors.baseContentMuted, 0.125, '#1f2937') },
		},
	}
}

export const lineChartOptions = (): ChartOptions<'line'> => ({
	responsive: true,
	maintainAspectRatio: true,
	plugins: themePlugin(),
	scales: themeScales(),
})

export const barChartOptions = (): ChartOptions<'bar'> => ({
	responsive: true,
	maintainAspectRatio: true,
	plugins: themePlugin(),
	scales: themeScales(),
})

export const horizontalBarChartOptions = (): ChartOptions<'bar'> => {
	const colors = getThemeColors()
	return {
		responsive: true,
		maintainAspectRatio: true,
		indexAxis: 'y',
		plugins: themePlugin(),
		scales: {
			x: {
				beginAtZero: true,
				ticks: { color: colors.baseContentMuted },
				grid: { color: withAlpha(colors.baseContentMuted, 0.125, '#1f2937') },
			},
			y: {
				ticks: { color: colors.baseContentMuted },
				grid: { display: false },
			},
		},
	}
}

export const doughnutChartOptions = (): ChartOptions<'doughnut'> => {
	const plugins = themePlugin()
	return {
		responsive: true,
		maintainAspectRatio: true,
		cutout: '60%',
		plugins: {
			...plugins,
			tooltip: {
				...plugins.tooltip,
				callbacks: {
					label: getDoughnutTooltipLabel,
				},
			},
		},
	}
}

export const scatterChartOptions = (): ChartOptions<'scatter'> => ({
	responsive: true,
	maintainAspectRatio: true,
	plugins: themePlugin(),
	scales: themeScales(),
})

export const bubbleChartOptions = (): ChartOptions<'bubble'> => ({
	responsive: true,
	maintainAspectRatio: true,
	plugins: themePlugin(),
	scales: themeScales(),
})

export const stackedBarChartOptions = (): ChartOptions<'bar'> => ({
	responsive: true,
	maintainAspectRatio: true,
	plugins: themePlugin(),
	scales: {
		x: {
			stacked: true,
			ticks: { color: getThemeColors().baseContentMuted },
			grid: {
				color: withAlpha(getThemeColors().baseContentMuted, 0.125, '#1f2937'),
			},
		},
		y: {
			stacked: true,
			ticks: { color: getThemeColors().baseContentMuted },
			grid: {
				color: withAlpha(getThemeColors().baseContentMuted, 0.125, '#1f2937'),
			},
		},
	},
})

export const matrixChartOptions = (): ChartOptions<'matrix'> => ({
	responsive: true,
	maintainAspectRatio: true,
	plugins: {
		...themePlugin(),
		tooltip: {
			mode: 'nearest',
			intersect: true,
			callbacks: {
				title: (items) => {
					const raw = getCalendarCell(items[0]?.raw)
					if (!raw) return ''
					return `${raw.day} (${weekdayLabels[raw.y] ?? ''})`
				},
				label: (item) => {
					const raw = getCalendarCell(item.raw)
					if (!raw) return ''
					const absValue = formatCurrency(Math.abs(raw.value))
					if (raw.value > 0) return `Daily Net Flow: +${absValue}`
					if (raw.value < 0) return `Daily Net Flow: -${absValue}`
					return `Daily Net Flow: ${formatCurrency(0)}`
				},
			},
		},
	},
	scales: {
		x: {
			type: 'linear',
			offset: false,
			ticks: { color: getThemeColors().baseContentMuted },
			grid: { display: false },
		},
		y: {
			type: 'linear',
			reverse: true,
			ticks: {
				color: getThemeColors().baseContentMuted,
				callback: (value) =>
					['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][+value] ?? '',
			},
			grid: { display: false },
		},
	},
})
