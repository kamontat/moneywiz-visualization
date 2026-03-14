import type { FilterBy, FilterByFunc } from './models'
import { FILTER_TYPES } from './models'

export const byDateRange: FilterByFunc<[Date, Date]> = (start, end) => {
	const by: FilterBy = (trx) => {
		return trx.date >= start && trx.date <= end
	}
	by.type = FILTER_TYPES.DATE_RANGE
	return by
}
