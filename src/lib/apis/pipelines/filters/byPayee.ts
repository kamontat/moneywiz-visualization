import type { FilterFn } from '../types.js'
import type { DataTransaction } from '$lib/apis/record/transactions/types.js'

export function byPayee(
	payees: ReadonlyArray<string>
): FilterFn<DataTransaction> {
	const allowed = new Set(payees)
	return (input) => input.filter((tx) => allowed.has(tx.payee))
}
