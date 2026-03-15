import type { FilterFn } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

export function byAccount(
	accountIds: ReadonlyArray<number>
): FilterFn<DataTransaction> {
	const allowed = new Set(accountIds)
	return (input) => input.filter((tx) => allowed.has(tx.accountId))
}
