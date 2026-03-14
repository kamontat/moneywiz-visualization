import type { StatsRange, Summarize } from './models/index.js'
import type { DataTransaction } from '$lib/apis/record/transactions/types.js'
import { formatDate } from '$lib/formatters/date.js'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const toStartOfDay = (value: Date): Date => {
	const date = new Date(value)
	date.setHours(0, 0, 0, 0)
	return date
}

const toEndOfDay = (value: Date): Date => {
	const date = new Date(value)
	date.setHours(23, 59, 59, 999)
	return date
}

const getDaysInclusive = (start: Date, end: Date): number => {
	const diff = toStartOfDay(end).getTime() - toStartOfDay(start).getTime()
	return Math.max(1, Math.floor(diff / ONE_DAY_MS) + 1)
}

const toRangeLabel = (start: Date, end: Date): string => {
	const startLabel = formatDate(start)
	const endLabel = formatDate(end)
	return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`
}

const toStatsRange = (start: Date, end: Date): StatsRange => {
	const normalizedStart = toStartOfDay(start)
	const normalizedEnd = toEndOfDay(end)

	return {
		start: normalizedStart,
		end: normalizedEnd,
		days: getDaysInclusive(normalizedStart, normalizedEnd),
		label: toRangeLabel(normalizedStart, normalizedEnd),
	}
}

export function summarizeTransactions(
	transactions: readonly DataTransaction[]
): Summarize | undefined {
	if (transactions.length === 0) return undefined

	let totalIncome = 0
	let grossExpenses = 0
	let totalRefunds = 0
	let totalDebt = 0
	let totalDebtRepayment = 0
	let totalWindfall = 0
	let totalGiveaway = 0
	let totalBuy = 0
	let totalSell = 0
	let minDate = transactions[0].date
	let maxDate = transactions[0].date

	for (const transaction of transactions) {
		if (transaction.date < minDate) minDate = transaction.date
		if (transaction.date > maxDate) maxDate = transaction.date

		switch (transaction.type) {
			case 'income':
				totalIncome += transaction.amount
				break
			case 'expense':
				grossExpenses += Math.abs(transaction.amount)
				break
			case 'refund':
				totalRefunds += transaction.amount
				break
			case 'debt':
				totalDebt += Math.abs(transaction.amount)
				break
			case 'debt_repayment':
				totalDebtRepayment += Math.abs(transaction.amount)
				break
			case 'windfall':
				totalWindfall += transaction.amount
				totalIncome += transaction.amount
				break
			case 'giveaway':
				totalGiveaway += Math.abs(transaction.amount)
				grossExpenses += Math.abs(transaction.amount)
				break
			case 'buy':
				totalBuy += Math.abs(transaction.amount)
				break
			case 'sell':
				totalSell += transaction.amount
				break
		}
	}

	const netExpenses = grossExpenses - totalRefunds
	const netCashFlow = totalIncome - netExpenses
	const savingsRate = totalIncome === 0 ? 0 : (netCashFlow / totalIncome) * 100

	return {
		totalIncome,
		grossExpenses,
		totalRefunds,
		netExpenses,
		netCashFlow,
		savingsRate,
		transactionCount: transactions.length,
		dateRange: {
			start: minDate,
			end: maxDate,
		},
		totalDebt,
		totalDebtRepayment,
		totalWindfall,
		totalGiveaway,
		totalBuy,
		totalSell,
	}
}

export function deriveCurrentRange(
	transactions: readonly { date: Date }[],
	explicitStart?: Date,
	explicitEnd?: Date,
	autoWindowDays = 30
): StatsRange | null {
	if (explicitStart || explicitEnd) {
		let start = explicitStart ?? explicitEnd
		let end = explicitEnd ?? explicitStart

		if (!start || !end) return null
		if (start.getTime() > end.getTime()) {
			const temp = start
			start = end
			end = temp
		}

		return toStatsRange(start, end)
	}

	if (transactions.length === 0) return null

	let end = transactions[0].date
	for (const transaction of transactions) {
		if (transaction.date > end) end = transaction.date
	}

	const normalizedEnd = toEndOfDay(end)
	const start = new Date(normalizedEnd)
	start.setDate(start.getDate() - Math.max(1, autoWindowDays) + 1)

	return toStatsRange(start, normalizedEnd)
}

export function deriveBaselineRange(
	currentRange: StatsRange | null
): StatsRange | null {
	if (!currentRange) return null

	const end = new Date(currentRange.start)
	end.setDate(end.getDate() - 1)
	const normalizedEnd = toEndOfDay(end)

	const start = new Date(normalizedEnd)
	start.setDate(start.getDate() - currentRange.days + 1)

	return toStatsRange(start, normalizedEnd)
}

export function sliceByDateRange<T extends { date: Date }>(
	transactions: readonly T[],
	range: StatsRange | null
): T[] {
	if (!range) return []

	return transactions.filter(
		(transaction) =>
			transaction.date.getTime() >= range.start.getTime() &&
			transaction.date.getTime() <= range.end.getTime()
	)
}
