import type { FilterBy, FilterByFunc } from './models'

export const byDateRange: FilterByFunc<[Date, Date]> = (start, end) => {
	const by: FilterBy = (trx) => {
		return trx.date >= start && trx.date <= end
	}
	by.type = 'byDateRange'
	return by
}
