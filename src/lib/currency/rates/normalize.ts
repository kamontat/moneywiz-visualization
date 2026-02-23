import type { ParsedTransaction } from '$lib/transactions/models'
import { BASE_CURRENCY } from '$lib/currency/constants'

const EPSILON = 0.000001

export const normalizeCurrencyCode = (
	currency: string | undefined | null
): string => {
	if (!currency) return BASE_CURRENCY
	const normalized = currency.trim().toUpperCase()
	return normalized.length > 0 ? normalized : BASE_CURRENCY
}

export const toTransactionDateKey = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export const toFiniteNumber = (value: unknown): number | undefined => {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string') {
		const parsed = Number(value)
		if (Number.isFinite(parsed)) return parsed
	}
	return undefined
}

const toRawCurrency = (transaction: ParsedTransaction): string | undefined => {
	const currency = transaction.raw.currency
	if (typeof currency !== 'string') return undefined
	const normalized = currency.trim().toUpperCase()
	return normalized.length > 0 ? normalized : undefined
}

export const hasExactRawThbAmount = (
	transaction: ParsedTransaction
): boolean => {
	const rawCurrency = toRawCurrency(transaction)
	if (!rawCurrency || rawCurrency === BASE_CURRENCY) return false

	const rawAmount = toFiniteNumber(transaction.raw.amount)
	const rawOriginalAmount = toFiniteNumber(transaction.raw.originalAmount)
	if (rawAmount === undefined || rawOriginalAmount === undefined) return false
	if (Math.abs(rawOriginalAmount) < EPSILON) return false

	return Math.abs(Math.abs(rawAmount) - Math.abs(rawOriginalAmount)) > EPSILON
}

export const getExactRawThbAmount = (
	transaction: ParsedTransaction
): number | undefined => {
	if (!hasExactRawThbAmount(transaction)) return undefined
	return toFiniteNumber(transaction.raw.amount)
}
