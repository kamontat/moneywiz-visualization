import type { ParsedTransaction } from '$lib/transactions/models'

export type FilterBy = {
	type: string;
	(trx: ParsedTransaction): boolean
}

export type FilterByFunc<ARGS extends unknown[]> = (...args: ARGS) => FilterBy
