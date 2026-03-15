import type { FilterFn } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

export function byPayee(
	payees: ReadonlyArray<string>
): FilterFn<DataTransaction> {
	const allowed = new Set(payees)
	return (input) => input.filter((tx) => allowed.has(tx.payee))
}
