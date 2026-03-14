import type { ReduceFn } from '../types.js'
import type { DataTransaction } from '$lib/apis/record/transactions/types.js'

export function sumAmount(): ReduceFn<DataTransaction, number> {
	return (init, input) => {
		let sum = init
		for (const tx of input) {
			sum += tx.amount
		}
		return sum
	}
}
