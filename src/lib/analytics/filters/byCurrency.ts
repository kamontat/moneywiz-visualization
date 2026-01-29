import type { FilterBy, FilterByFunc } from './models'

export const byCurrency: FilterByFunc<[string]> = (currency) => {
	const by: FilterBy = (trx) => {
		return trx.amount.currency === currency
	}
	by.type = 'byCurrency'
	return by
}
