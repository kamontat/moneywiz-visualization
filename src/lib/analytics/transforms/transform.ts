import { analytics } from '$lib/loggers'
import type { ParsedTransaction } from '$lib/transactions'
import type { TransformBy } from './models'

export const transform = <O>(trx: ParsedTransaction[], by: TransformBy<O>): O => {
	const log = analytics.extends('transform')
	log.debug(`starting transform of type "${by.type}" on ${trx.length} transactions`)

	return by(trx)
}
