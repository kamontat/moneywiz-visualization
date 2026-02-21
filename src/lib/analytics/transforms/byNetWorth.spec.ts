import type { WaterfallStep } from './models'
import { describe, expect, it } from 'vitest'

import { toNetWorthSummary } from './byNetWorth'

const step = (
	label: string,
	net: number,
	startBalance: number,
	endBalance: number
): WaterfallStep => ({
	label,
	income: 0,
	expense: 0,
	debt: 0,
	buySell: 0,
	net,
	startBalance,
	endBalance,
})

describe('toNetWorthSummary', () => {
	it('returns empty-safe summary for no points', () => {
		expect(toNetWorthSummary([])).toEqual({
			points: [],
			currentNetWorth: 0,
			peakNetWorth: 0,
			peakMonth: null,
			troughNetWorth: 0,
			troughMonth: null,
			latestMonthlyChange: 0,
			averageMonthlyChange: 0,
			monthCount: 0,
		})
	})

	it('maps a single month into net worth point and summary', () => {
		const summary = toNetWorthSummary([step('Jan 2026', 450, 0, 450)])

		expect(summary.points).toEqual([
			{
				label: 'Jan 2026',
				netWorth: 450,
				monthlyChange: 450,
			},
		])
		expect(summary.currentNetWorth).toBe(450)
		expect(summary.peakNetWorth).toBe(450)
		expect(summary.peakMonth).toBe('Jan 2026')
		expect(summary.troughNetWorth).toBe(450)
		expect(summary.troughMonth).toBe('Jan 2026')
		expect(summary.latestMonthlyChange).toBe(450)
		expect(summary.averageMonthlyChange).toBe(450)
		expect(summary.monthCount).toBe(1)
	})

	it('computes peak, trough, latest, and average across months', () => {
		const summary = toNetWorthSummary([
			step('Jan 2026', 100, 0, 100),
			step('Feb 2026', -50, 100, 50),
			step('Mar 2026', 50, 50, 100),
			step('Apr 2026', -50, 100, 50),
		])

		expect(summary.currentNetWorth).toBe(50)
		expect(summary.peakNetWorth).toBe(100)
		expect(summary.peakMonth).toBe('Jan 2026')
		expect(summary.troughNetWorth).toBe(50)
		expect(summary.troughMonth).toBe('Feb 2026')
		expect(summary.latestMonthlyChange).toBe(-50)
		expect(summary.averageMonthlyChange).toBeCloseTo(12.5)
		expect(summary.monthCount).toBe(4)
	})
})
