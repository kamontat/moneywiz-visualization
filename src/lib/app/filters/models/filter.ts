import type { FilterType } from './constants'
import type { ParsedTransaction } from '$lib/transactions/models'

export type FilterBy = {
	type: FilterType;
	(trx: ParsedTransaction): boolean
}

export type FilterByFunc<ARGS extends unknown[]> = (...args: ARGS) => FilterBy
