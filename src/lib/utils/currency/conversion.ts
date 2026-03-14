import { BASE_CURRENCY } from './constants.js'

export const normalizeCurrencyCode = (
	currency: string | undefined | null
): string => {
	if (!currency) return BASE_CURRENCY
	const normalized = currency.trim().toUpperCase()
	return normalized.length > 0 ? normalized : BASE_CURRENCY
}

export const toDateKey = (date: Date): string => {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

export const toFiniteNumber = (value: unknown): number | undefined => {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string') {
		const parsed = Number(value)
		if (Number.isFinite(parsed)) return parsed
	}
	return undefined
}
