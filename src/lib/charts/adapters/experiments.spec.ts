import type { NetWorthPoint } from '$lib/analytics/transforms/models'
import { describe, expect, it } from 'vitest'

import { toNetWorthChartData } from './experiments'

const points: NetWorthPoint[] = [
	{ label: 'Jan 2026', netWorth: 100, monthlyChange: 100 },
	{ label: 'Feb 2026', netWorth: 180, monthlyChange: 80 },
	{ label: 'Mar 2026', netWorth: 120, monthlyChange: -60 },
	{ label: 'Apr 2026', netWorth: 120, monthlyChange: 0 },
]

describe('toNetWorthChartData', () => {
	it('maps labels and datasets in mixed line/bar order', () => {
		const result = toNetWorthChartData(points)

		expect(result.labels).toEqual([
			'Jan 2026',
			'Feb 2026',
			'Mar 2026',
			'Apr 2026',
		])
		expect(result.datasets).toHaveLength(2)
		expect(result.datasets[0]?.type).toBe('line')
		expect(result.datasets[0]?.label).toBe('Net Worth')
		expect(result.datasets[0]?.data).toEqual([100, 180, 120, 120])
		expect(result.datasets[1]?.type).toBe('bar')
		expect(result.datasets[1]?.label).toBe('Monthly Change')
		expect(result.datasets[1]?.data).toEqual([100, 80, -60, 0])
	})

	it('maps monthly-change colors by sign', () => {
		const result = toNetWorthChartData(points)
		const colors = result.datasets[1]?.backgroundColor as string[]

		expect(colors).toEqual(['#22c55e', '#22c55e', '#ef4444', '#6b7280'])
	})

	it('returns empty-safe chart data', () => {
		const result = toNetWorthChartData([])

		expect(result.labels).toEqual([])
		expect(result.datasets).toHaveLength(2)
		expect(result.datasets[0]?.data).toEqual([])
		expect(result.datasets[1]?.data).toEqual([])
	})
})
