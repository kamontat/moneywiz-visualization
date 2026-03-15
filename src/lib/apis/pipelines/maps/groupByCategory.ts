import type { MapFn } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

export interface CategoryGroup {
	readonly category: string
	readonly transactions: readonly DataTransaction[]
}

export function groupByCategory(): MapFn<DataTransaction, CategoryGroup> {
	return (input) => {
		const map = new Map<string, DataTransaction[]>()
		for (const tx of input) {
			const key = tx.category || '(uncategorized)'
			const group = map.get(key)
			if (group) {
				group.push(tx)
			} else {
				map.set(key, [tx])
			}
		}
		return Array.from(map, ([category, transactions]) => ({
			category,
			transactions,
		}))
	}
}
