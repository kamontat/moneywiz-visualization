import type { TransformBy, WaterfallStep } from './models'
import { formatDate } from '$lib/formatters/date'

export const byMonthlyWaterfall: TransformBy<WaterfallStep[]> = (trx) => {
	const monthly = new Map<string, Omit<WaterfallStep, 'label'>>()

	for (const t of trx) {
		const key = formatDate(t.date, 'YYYY-MM')
		if (!monthly.has(key)) {
			monthly.set(key, {
				income: 0,
				expense: 0,
				debt: 0,
				buySell: 0,
				net: 0,
				startBalance: 0,
				endBalance: 0,
			})
		}

		const entry = monthly.get(key)
		if (!entry) continue

		switch (t.type) {
			case 'Income':
			case 'Windfall':
				entry.income += t.amount.value
				break
			case 'Expense':
			case 'Giveaway':
				entry.expense += Math.abs(t.amount.value)
				break
			case 'Refund':
				entry.expense -= t.amount.value
				break
			case 'Debt':
				entry.debt += Math.abs(t.amount.value)
				break
			case 'DebtRepayment':
				entry.income += Math.abs(t.amount.value)
				break
			case 'Buy':
				entry.buySell -= Math.abs(t.amount.value)
				break
			case 'Sell':
				entry.buySell += t.amount.value
				break
		}
	}

	const keys = Array.from(monthly.keys()).sort()
	let running = 0

	return keys.map((key) => {
		const entry = monthly.get(key)!
		const net = entry.income - entry.expense - entry.debt + entry.buySell
		const startBalance = running
		const endBalance = startBalance + net
		running = endBalance

		return {
			label: formatDate(new Date(`${key}-01`), 'MMM YYYY'),
			income: entry.income,
			expense: entry.expense,
			debt: entry.debt,
			buySell: entry.buySell,
			net,
			startBalance,
			endBalance,
		}
	})
}

byMonthlyWaterfall.type = 'byMonthlyWaterfall'
