import type { ReduceFn } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

export function sumAmount(): ReduceFn<DataTransaction, number> {
	return (init, input) => {
		let sum = init
		for (const tx of input) {
			sum += tx.amount
		}
		return sum
	}
}
