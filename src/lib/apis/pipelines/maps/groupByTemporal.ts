import type { MapFn } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

export type TemporalPeriod = 'day' | 'week' | 'month' | 'year'

export interface TemporalGroup {
	readonly period: string
	readonly transactions: readonly DataTransaction[]
}

function toKey(date: Date, period: TemporalPeriod): string {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')

	switch (period) {
		case 'day':
			return `${y}-${m}-${d}`
		case 'week': {
			const jan1 = new Date(y, 0, 1)
			const dayOfYear =
				Math.floor((date.getTime() - jan1.getTime()) / 86_400_000) + 1
			const week = String(Math.ceil(dayOfYear / 7)).padStart(2, '0')
			return `${y}-W${week}`
		}
		case 'month':
			return `${y}-${m}`
		case 'year':
			return `${y}`
	}
}

export function groupByTemporal(
	period: TemporalPeriod
): MapFn<DataTransaction, TemporalGroup> {
	return (input) => {
		const map = new Map<string, DataTransaction[]>()
		for (const tx of input) {
			const key = toKey(tx.date, period)
			const group = map.get(key)
			if (group) {
				group.push(tx)
			} else {
				map.set(key, [tx])
			}
		}
		return Array.from(map, ([period, transactions]) => ({
			period,
			transactions,
		}))
	}
}
