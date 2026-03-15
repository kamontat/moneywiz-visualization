import type { ChartConfiguration } from 'chart.js'
import type { OutlierPoint, RegimeSegment } from '$lib/app/dashboard'
import { getThemeColors, withAlpha } from '$lib/charts/theme'

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
