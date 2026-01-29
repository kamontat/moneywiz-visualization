import type { ParsedTransaction } from '$lib/transactions'

export type AnalyticFunc<O> = (trx: ParsedTransaction[]) => O

export type FilterBy = {
	type: string;
	(trx: ParsedTransaction): boolean
}

export type FilterFunc = (trx: ParsedTransaction[], ...bys: FilterBy[]) => ParsedTransaction[]
