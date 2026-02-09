import type { ChartOptions } from 'chart.js'
import { getThemeColors } from '../theme'

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
			grid: { color: colors.baseContentMuted + '20' },
		},
		y: {
			beginAtZero: true,
			ticks: { color: colors.baseContentMuted },
			grid: { color: colors.baseContentMuted + '20' },
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
				grid: { color: colors.baseContentMuted + '20' },
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
