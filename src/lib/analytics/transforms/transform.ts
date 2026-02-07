import type { TransformBy } from './models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { analytic } from '$lib/loggers'

export const transform = <O>(
	trx: ParsedTransaction[],
	by: TransformBy<O>
): O => {
	const log = analytic.extends('transform')
	log.debug(
		`starting transform of type "${by.type}" on ${trx.length} transactions`
	)

	return by(trx)
}
