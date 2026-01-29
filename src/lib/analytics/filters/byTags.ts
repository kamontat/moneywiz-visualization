import type { FilterBy } from '../models'

export type FilterTagMode = 'include' | 'exclude'

export interface FilterTags {
	category: string
	values: string[]
	mode: FilterTagMode
}

export const byTags = (...tags: FilterTags[]) => {
	const by: FilterBy = (trx) => {
		// TODO: implement date range filter
		return true
	}
	by.type = 'byDateRange'
	return by
}
