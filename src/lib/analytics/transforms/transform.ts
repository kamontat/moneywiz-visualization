import type { TransformBy } from './models'
import type { ParsedTransaction } from '$lib/transactions'
import { analytics } from '$lib/loggers'

export const transform = <O>(trx: ParsedTransaction[], by: TransformBy<O>): O => {
	const log = analytics.extends('transform')
	log.debug(`starting transform of type "${by.type}" on ${trx.length} transactions`)

	return by(trx)
}
