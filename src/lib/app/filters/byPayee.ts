import type { FilterBy, FilterByFunc, FilterPayee } from './models'
import { FILTER_TYPES } from './models'

export const byPayee: FilterByFunc<[FilterPayee]> = (filter) => {
	const by: FilterBy = (trx) => {
		if (!('payee' in trx)) return false
		return filter.payees.some((p) => p === trx.payee)
	}
	by.type = FILTER_TYPES.PAYEE
	return by
}
