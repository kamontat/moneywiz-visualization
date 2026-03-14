import type { FilterFn, FilterMode } from '../types.js'
import type {
	DataTransaction,
	TransactionType,
} from '$lib/apis/record/transactions/types.js'

export function byTransactionType(
	types: ReadonlyArray<TransactionType>,
	mode: FilterMode = 'include'
): FilterFn<DataTransaction> {
	const allowed = new Set(types)
	return (input) =>
		input.filter((tx) => {
			const matches = allowed.has(tx.type)
			return mode === 'include' ? matches : !matches
		})
}
