import type { ParsedTransaction } from '$lib/transactions/models'

export type TransformBy<O> = {
	type: string;
	(trx: ParsedTransaction[]): O
}

export type TransformByFunc<ARGS extends unknown[], O> = (
	...args: ARGS
) => TransformBy<O>
