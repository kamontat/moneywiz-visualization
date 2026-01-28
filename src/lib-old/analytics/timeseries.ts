/**
 * Time series analysis for financial data
 */

import { parseAmountTHB, parseDateDDMMYYYY } from '../finance'
import { getDateRange } from './filters'

export interface DailyItem {
	day: number
	value: number
}

export interface DailyExpensesData {
	items: DailyItem[]
	max: number
	label: string
}

export interface IncomeExpenseTimeSeries {
	labels: string[]
	income: number[]
	expenses: number[]
	net: number[]
	mode: 'daily' | 'monthly'
}

/**
 * Calculate daily expenses for the most recent month
 */
export function calculateDailyExpenses(thbRows: Record<string, string>[]): DailyExpensesData {
	// Find latest date in THB rows
	const dates = thbRows
		.map((r) => parseDateDDMMYYYY(r['Date'] || ''))
		.filter((d): d is Date => d instanceof Date)
	if (dates.length === 0) return { items: [], max: 0, label: '' }

	const latest = new Date(Math.max(...dates.map((d) => d.getTime())))
	const month = latest.getMonth()
	const year = latest.getFullYear()

	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const perDay: number[] = Array.from({ length: daysInMonth }, () => 0)

	for (const r of thbRows) {
		const d = parseDateDDMMYYYY(r['Date'] || '')
		if (!d || d.getMonth() !== month || d.getFullYear() !== year) continue
		const amt = parseAmountTHB(r['Amount'] || '0')
		if (amt < 0) {
			const dayIdx = d.getDate() - 1
			perDay[dayIdx] += Math.abs(amt)
		}
	}

	const max = perDay.reduce((m, v) => Math.max(m, v), 0)
	const items = perDay.map((v, i) => ({ day: i + 1, value: v }))
	const label = `${latest.toLocaleString(undefined, { month: 'long' })} ${year}`
	return { items, max, label }
}

/**
 * Calculate income, expense, and net over time.
 * Automatically switches between daily and monthly aggregation based on duration.
 */
export function calculateIncomeExpenseTimeSeries(
	thbRows: Record<string, string>[],
	start: Date | null,
	end: Date | null
): IncomeExpenseTimeSeries {
	if (!start || !end) {
		const range = getDateRange(thbRows)
		if (!range) {
			return { labels: [], income: [], expenses: [], net: [], mode: 'daily' }
		}
		start = start || range.start
		end = end || range.end
	}

	// Calculate duration in days
	const diffTime = Math.abs(end.getTime() - start.getTime())
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	// Threshold: > 62 days (approx 2 months) -> Monthly
	const mode: 'daily' | 'monthly' = diffDays > 62 ? 'monthly' : 'daily'

	const labels: string[] = []
	const incomeData: number[] = []
	const expensesData: number[] = []
	const netData: number[] = []

	// Pre-aggregate data
	// Map key -> { income, expense }
	const agg = new Map<string, { i: number; e: number }>()

	for (const row of thbRows) {
		const d = parseDateDDMMYYYY(row['Date'] || '')
		if (!d) continue
		if (d < start || d > end) continue

		let key = ''
		if (mode === 'daily') {
			// Key: YYYY-MM-DD (ISOish but local)
			const y = d.getFullYear()
			const m = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			key = `${y}-${m}-${day}`
		} else {
			// Key: YYYY-MM
			const y = d.getFullYear()
			const m = String(d.getMonth() + 1).padStart(2, '0')
			key = `${y}-${m}`
		}

		const amt = parseAmountTHB(row['Amount'] || '0')
		const current = agg.get(key) || { i: 0, e: 0 }

		if (amt >= 0) current.i += amt
		else current.e += Math.abs(amt) // Store expense as positive magnitude

		agg.set(key, current)
	}

	// Generate continuous timeline
	const current = new Date(start)
	// Reset to start of period just in case
	if (mode === 'monthly') {
		current.setDate(1) // Start of month
	}

	while (current <= end) {
		let key = ''
		let label = ''

		if (mode === 'daily') {
			const y = current.getFullYear()
			const m = String(current.getMonth() + 1).padStart(2, '0')
			const d = String(current.getDate()).padStart(2, '0')
			key = `${y}-${m}-${d}`
			label = `${d}/${m}` // DD/MM
		} else {
			const y = current.getFullYear()
			const m = String(current.getMonth() + 1).padStart(2, '0')
			key = `${y}-${m}`
			label = current.toLocaleString('default', { month: 'short', year: '2-digit' }) // Jan 23
		}

		const data = agg.get(key) || { i: 0, e: 0 }
		labels.push(label)
		incomeData.push(data.i)
		expensesData.push(data.e)

		// Net = Income - Expense (since expense is magnitude)
		netData.push(data.i - data.e)

		// Advance time
		if (mode === 'daily') {
			current.setDate(current.getDate() + 1)
		} else {
			current.setMonth(current.getMonth() + 1)
			current.setDate(1) // Keep at start of month to avoid overflow issues (Jan 31 -> Feb 28/Mar 3)
		}
	}

	return {
		labels,
		income: incomeData,
		expenses: expensesData,
		net: netData,
		mode,
	}
}
