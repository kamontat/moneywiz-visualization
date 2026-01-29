import type { FilterBy } from '../models'

export const byDateRange = (startDate: Date, endDate: Date) => {
	const by: FilterBy = (trx) => {
		// TODO: implement date range filter
		return true
	}
	by.type = 'byDateRange'
	return by
}
