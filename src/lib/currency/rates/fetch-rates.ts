import type { DateSpan, FetchLike } from './types'
import { toFiniteNumber } from './normalize'

import { BASE_CURRENCY, FX_PROVIDER_BASE_URL } from '$lib/currency/constants'

export const parseRatesPayload = (payload: unknown): Record<string, number> => {
	if (!payload || typeof payload !== 'object') return {}

	const body = payload as Record<string, unknown>
	const ratesNode = body.rates
	if (!ratesNode || typeof ratesNode !== 'object') return {}

	const entries = Object.entries(ratesNode)
	if (entries.length === 0) return {}

	const firstValue = entries[0][1]
	if (typeof firstValue === 'number') {
		const rate = toFiniteNumber(
			(ratesNode as Record<string, unknown>)[BASE_CURRENCY]
		)
		const singleDate =
			typeof body.date === 'string'
				? body.date
				: typeof body.end_date === 'string'
					? body.end_date
					: undefined
		if (!singleDate || rate === undefined || rate <= 0) return {}
		return { [singleDate]: rate }
	}

	const parsed: Record<string, number> = {}
	for (const [marketDate, value] of entries) {
		if (!value || typeof value !== 'object') continue
		const rate = toFiniteNumber(
			(value as Record<string, unknown>)[BASE_CURRENCY]
		)
		if (rate === undefined || rate <= 0) continue
		parsed[marketDate] = rate
	}

	return parsed
}

export const fetchRangeRates = async (
	currency: string,
	span: DateSpan,
	fetcher: FetchLike
): Promise<Record<string, number>> => {
	const from = encodeURIComponent(currency)
	const to = encodeURIComponent(BASE_CURRENCY)
	const url =
		`${FX_PROVIDER_BASE_URL}/${span.start}..${span.end}` +
		`?from=${from}&to=${to}`

	const response = await fetcher(url)
	if (!response.ok) {
		throw new Error(
			`FX provider request failed for ${currency} ` +
				`(${span.start}..${span.end}) with HTTP ${response.status}`
		)
	}

	const payload = (await response.json()) as unknown
	return parseRatesPayload(payload)
}
