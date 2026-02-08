import type { FilterBy, FilterByFunc } from './models'
import { getCategoryFullName } from '$lib/transactions/utils'

export type FilterCategoryMode = 'include' | 'exclude'

export interface FilterCategory {
	categories: string[]
	mode: FilterCategoryMode
}

export const byCategory: FilterByFunc<[FilterCategory]> = (filter) => {
	const by: FilterBy = (trx) => {
		if (!('category' in trx)) {
			return filter.mode === 'exclude'
		}

		const fullName = getCategoryFullName(trx.category)
		const matches = filter.categories.some(
			(cat) => fullName === cat || fullName.startsWith(cat + ' >')
		)

		if (filter.mode === 'include') return matches
		return !matches
	}
	by.type = 'byCategory'
	return by
}
