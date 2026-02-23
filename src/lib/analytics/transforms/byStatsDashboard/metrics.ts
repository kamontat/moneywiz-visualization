import type {
	StatsConcentrationItem,
	StatsCurrencyMeta,
	StatsDelta,
	StatsDeltaDirection,
	StatsDeltaMetric,
	StatsKpiItem,
} from '$lib/analytics/transforms/models'
import type { ParsedTransaction } from '$lib/transactions/models'

const EPSILON = 0.00001

export const resolveDelta = (
	current: number,
	baseline: number | null,
	epsilon = EPSILON
): StatsDelta => {
	if (baseline === null) {
		return {
			current,
			baseline: null,
			delta: null,
			deltaPct: null,
			trend: 'na',
		}
	}

	const delta = current - baseline
	let trend: StatsDelta['trend'] = 'flat'
	if (delta > epsilon) trend = 'up'
	if (delta < -epsilon) trend = 'down'

	return {
		current,
		baseline,
		delta,
		deltaPct:
			Math.abs(baseline) < epsilon ? null : (delta / Math.abs(baseline)) * 100,
		trend,
	}
}

export const toKpi = (input: {
	id: string
	label: string
	unit: StatsKpiItem['unit']
	value: number
	baseline: number | null
	betterWhen: StatsDeltaDirection
}): StatsKpiItem => {
	return {
		id: input.id,
		label: input.label,
		unit: input.unit,
		value: input.value,
		delta: resolveDelta(input.value, input.baseline),
		betterWhen: input.betterWhen,
	}
}

export const toComparison = (
	id: string,
	label: string,
	current: number,
	baseline: number | null,
	betterWhen: StatsDeltaDirection
): StatsDeltaMetric => ({
	id,
	label,
	delta: resolveDelta(current, baseline),
	betterWhen,
})

export const toHhi = (items: StatsConcentrationItem[]): number => {
	if (items.length === 0) return 0
	return items.reduce((sum, item) => {
		const share = item.share / 100
		return sum + share * share
	}, 0)
}

export const toCurrencyMeta = (
	transactions: ParsedTransaction[]
): StatsCurrencyMeta => {
	const counts: Record<string, number> = {}

	for (const transaction of transactions) {
		const currency = transaction.amount.currency || 'Unknown'
		counts[currency] = (counts[currency] ?? 0) + 1
	}

	let primaryCurrency = 'THB'
	let max = 0

	for (const [currency, count] of Object.entries(counts)) {
		if (count > max) {
			max = count
			primaryCurrency = currency
		}
	}

	return {
		primaryCurrency,
		mixedCurrency: Object.keys(counts).length > 1,
		counts,
	}
}
