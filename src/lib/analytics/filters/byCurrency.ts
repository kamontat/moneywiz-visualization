import type { FilterBy } from '../models'

export const byCurrency = (currency: string) => {
	const by: FilterBy = (trx) => {
		// TODO: implement currency filter
		return true
	}
	by.type = 'byCurrency'
	return by
}
