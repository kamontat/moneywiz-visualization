import type { ChartOptions } from 'chart.js'
import { getThemeColors, withAlpha } from '../theme'

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

export const doughnutChartOptions = (): ChartOptions<'doughnut'> => ({
	responsive: true,
	maintainAspectRatio: true,
	cutout: '60%',
	plugins: themePlugin(),
})

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
	plugins: themePlugin(),
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
