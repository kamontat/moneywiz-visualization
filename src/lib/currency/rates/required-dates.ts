import type { DateSpan } from './types'
import type { ParsedTransaction } from '$lib/transactions/models'
import {
	hasExactRawThbAmount,
	normalizeCurrencyCode,
	toTransactionDateKey,
} from './normalize'

import { BASE_CURRENCY } from '$lib/currency/constants'

export const collectRequiredDates = (
	transactions: ParsedTransaction[]
): Map<string, Set<string>> => {
	const required = new Map<string, Set<string>>()

	for (const transaction of transactions) {
		const currency = normalizeCurrencyCode(transaction.amount.currency)
		if (currency === BASE_CURRENCY) continue
		if (hasExactRawThbAmount(transaction)) continue

		const date = toTransactionDateKey(transaction.date)
		const dates = required.get(currency)
		if (dates) {
			dates.add(date)
			continue
		}
		required.set(currency, new Set([date]))
	}

	return required
}

export const toMissingSpans = (
	requiredDates: string[],
	existingByDate: Record<string, number>
): DateSpan[] => {
	if (requiredDates.length === 0) return []

	const sortedRequired = [...requiredDates].sort()
	const requiredMin = sortedRequired[0]
	const requiredMax = sortedRequired[sortedRequired.length - 1]

	const existingDates = Object.keys(existingByDate).sort()
	if (existingDates.length === 0) {
		return [{ start: requiredMin, end: requiredMax }]
	}

	const spans: DateSpan[] = []
	const existingMin = existingDates[0]
	const existingMax = existingDates[existingDates.length - 1]

	if (requiredMin < existingMin) {
		spans.push({
			start: requiredMin,
			end: existingMin,
		})
	}

	if (requiredMax > existingMax) {
		spans.push({
			start: existingMax,
			end: requiredMax,
		})
	}

	return spans
}
