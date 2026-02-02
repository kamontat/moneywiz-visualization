import type { FilterByFunc, FilterBy } from './models'
import type { ParsedTransaction } from '$lib/transactions'
import { analytics } from '$lib/loggers/constants'

export const byAND: FilterByFunc<FilterBy[]> = (...bys): FilterBy => {
	const by: FilterBy = (trx) => {
		for (const b of bys) {
			if (!b(trx)) return false
		}
		return true
	}
	by.type = 'AND'
	return by
}
export const byOR: FilterByFunc<FilterBy[]> = (...bys): FilterBy => {
	const by: FilterBy = (trx) => {
		for (const b of bys) {
			if (b(trx)) return true
		}
		return false
	}
	by.type = 'OR'
	return by
}
export const byNOT: FilterByFunc<[FilterBy]> = (by): FilterBy => {
	const notBy: FilterBy = (trx) => !by(trx)
	notBy.type = 'NOT'
	return notBy
}

export const filter = (trx: ParsedTransaction[], ...bys: FilterBy[]) => {
	const log = analytics.extends('filter')
	log.debug(
		`starting filter with ${bys.length} criteria on ${trx.length} transactions`
	)
	const out = bys.reduce((filtered, by) => filtered.filter(by), trx)
	log.debug(`filter result: ${out.length} transactions after filtering`)

	return out
}
