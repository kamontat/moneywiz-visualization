import type { FilterFn } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

export function byDateRange(start: Date, end: Date): FilterFn<DataTransaction> {
	const startMs = start.getTime()
	const endMs = end.getTime()

	return (input) =>
		input.filter((tx) => {
			const t = tx.date.getTime()
			return t >= startMs && t <= endMs
		})
}
