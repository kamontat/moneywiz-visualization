import type { FilterBy, FilterByFunc, FilterCategory } from './models'
import { getCategoryFullName } from '$lib/transactions/utils'

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
