import type { FilterBy, FilterByFunc } from './models'
import type { ParsedTransactionType } from '$lib/transactions/models'

export type TransactionTypeFilterMode = 'include' | 'exclude'

export interface TransactionTypeFilter {
	types: ParsedTransactionType[]
	mode: TransactionTypeFilterMode
}

export const byTransactionType: FilterByFunc<[TransactionTypeFilter]> = (
	filter
) => {
	const by: FilterBy = (trx) => {
		const matches = filter.types.includes(trx.type)

		if (filter.mode === 'include') return matches
		return !matches
	}
	by.type = 'byTransactionType'
	return by
}
