import type {
	FxConversionResult,
	FxConversionSummary,
	FxRateTable,
	FxUnresolvedItem,
} from './models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { BASE_CURRENCY, createEmptyFxRateCacheState } from './constants'
import {
	getExactRawThbAmount,
	normalizeCurrencyCode,
	toTransactionDateKey,
} from './rates'

interface CurrencySeries {
	dates: string[]
	ratesByDate: Record<string, number>
}

const resolveRateForDate = (
	series: CurrencySeries,
	targetDate: string
): { marketDate: string; rate: number } | undefined => {
	const dates = series.dates
	if (dates.length === 0) return undefined

	let low = 0
	let high = dates.length - 1
	let candidate = -1

	while (low <= high) {
		const mid = Math.floor((low + high) / 2)
		const value = dates[mid]
		if (value <= targetDate) {
			candidate = mid
			low = mid + 1
			continue
		}
		high = mid - 1
	}

	if (candidate < 0) return undefined
	const marketDate = dates[candidate]
	const rate = series.ratesByDate[marketDate]
	if (!Number.isFinite(rate) || rate <= 0) return undefined

	return {
		marketDate,
		rate,
	}
}

const buildCurrencySeries = (
	table: FxRateTable
): Map<string, CurrencySeries> => {
	const map = new Map<string, CurrencySeries>()
	for (const [currency, ratesByDate] of Object.entries(table.rates)) {
		const normalizedCurrency = normalizeCurrencyCode(currency)
		map.set(normalizedCurrency, {
			dates: Object.keys(ratesByDate).sort(),
			ratesByDate,
		})
	}
	return map
}

const toUnresolvedByCurrency = (
	items: FxUnresolvedItem[]
): Record<string, number> => {
	const counts: Record<string, number> = {}
	for (const item of items) {
		counts[item.currency] = (counts[item.currency] ?? 0) + 1
	}
	return counts
}

const cloneAsTHB = (
	transaction: ParsedTransaction,
	value: number
): ParsedTransaction => {
	return {
		...transaction,
		amount: {
			...transaction.amount,
			value,
			currency: BASE_CURRENCY,
		},
	}
}

export const convertTransactionsToTHB = (
	transactions: ParsedTransaction[],
	table: FxRateTable
): FxConversionResult => {
	const fallbackTable: FxRateTable = table ?? {
		baseCurrency: BASE_CURRENCY,
		rates: createEmptyFxRateCacheState().rates,
	}
	const seriesByCurrency = buildCurrencySeries(fallbackTable)

	const converted: ParsedTransaction[] = []
	const unresolved: FxUnresolvedItem[] = []
	let exactCount = 0
	let estimatedCount = 0

	for (const transaction of transactions) {
		const currency = normalizeCurrencyCode(transaction.amount.currency)

		if (currency === BASE_CURRENCY) {
			converted.push(cloneAsTHB(transaction, transaction.amount.value))
			continue
		}

		const exactThb = getExactRawThbAmount(transaction)
		if (typeof exactThb === 'number' && Number.isFinite(exactThb)) {
			converted.push(cloneAsTHB(transaction, exactThb))
			exactCount += 1
			continue
		}

		const date = toTransactionDateKey(transaction.date)
		const series = seriesByCurrency.get(currency)
		if (!series) {
			unresolved.push({
				transactionId: transaction.id,
				currency,
				date,
			})
			continue
		}

		const resolved = resolveRateForDate(series, date)
		if (!resolved) {
			unresolved.push({
				transactionId: transaction.id,
				currency,
				date,
			})
			continue
		}

		const convertedAmount = transaction.amount.value * resolved.rate
		converted.push(cloneAsTHB(transaction, convertedAmount))
		estimatedCount += 1
	}

	const summary: FxConversionSummary = {
		total: transactions.length,
		convertedCount: converted.length,
		exactCount,
		estimatedCount,
		unresolvedCount: unresolved.length,
		unresolvedByCurrency: toUnresolvedByCurrency(unresolved),
	}

	return {
		transactions: converted,
		unresolved,
		summary,
	}
}

export const summarizeConversion = (
	summaries: FxConversionSummary[]
): FxConversionSummary => {
	const merged: FxConversionSummary = {
		total: 0,
		convertedCount: 0,
		exactCount: 0,
		estimatedCount: 0,
		unresolvedCount: 0,
		unresolvedByCurrency: {},
	}

	for (const summary of summaries) {
		merged.total += summary.total
		merged.convertedCount += summary.convertedCount
		merged.exactCount += summary.exactCount
		merged.estimatedCount += summary.estimatedCount
		merged.unresolvedCount += summary.unresolvedCount

		for (const [currency, count] of Object.entries(
			summary.unresolvedByCurrency
		)) {
			merged.unresolvedByCurrency[currency] =
				(merged.unresolvedByCurrency[currency] ?? 0) + count
		}
	}

	return merged
}
