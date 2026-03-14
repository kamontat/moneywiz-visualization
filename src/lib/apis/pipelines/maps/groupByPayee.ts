import type { MapFn } from '../types.js'
import type { DataTransaction } from '$lib/apis/record/transactions/types.js'

export interface PayeeGroup {
	readonly payee: string
	readonly transactions: readonly DataTransaction[]
}

export function groupByPayee(): MapFn<DataTransaction, PayeeGroup> {
	return (input) => {
		const map = new Map<string, DataTransaction[]>()
		for (const tx of input) {
			const key = tx.payee || '(no payee)'
			const group = map.get(key)
			if (group) {
				group.push(tx)
			} else {
				map.set(key, [tx])
			}
		}
		return Array.from(map, ([payee, transactions]) => ({
			payee,
			transactions,
		}))
	}
}
