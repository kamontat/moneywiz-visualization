import type { FilterBy, FilterByFunc } from './models'
import { FILTER_TYPES } from './models'

export const byCurrency: FilterByFunc<[string]> = (currency) => {
	const by: FilterBy = (trx) => {
		return trx.amount.currency === currency
	}
	by.type = FILTER_TYPES.CURRENCY
	return by
}
