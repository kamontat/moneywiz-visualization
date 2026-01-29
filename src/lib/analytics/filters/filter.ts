import type { FilterBy, FilterFunc } from '../models'

export const byAND = (...bys: FilterBy[]): FilterBy => {
	const by: FilterBy = (trx) => {
		for (const b of bys) {
			if (!b(trx)) return false
		}
		return true
	}
	by.type = 'AND'
	return by
}
export const byOR = (...bys: FilterBy[]): FilterBy => {
	const by: FilterBy = (trx) => {
		for (const b of bys) {
			if (b(trx)) return true
		}
		return false
	}
	by.type = 'OR'
	return by
}
export const byNOT = (by: FilterBy): FilterBy => {
	const notBy: FilterBy = (trx) => !by(trx)
	notBy.type = 'NOT'
	return notBy
}

export const filter: FilterFunc = (trx, ...bys) => {
	return bys.reduce((filtered, by) => filtered.filter(by), trx)
}
