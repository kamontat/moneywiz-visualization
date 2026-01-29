import type { FilterBy, FilterByFunc } from './models'

export type FilterTagMode = 'include' | 'exclude'

export interface FilterTags {
	category: string
	values: string[]
	mode: FilterTagMode
}

export const byTags: FilterByFunc<FilterTags[]> = (...tags) => {
	const by: FilterBy = (trx) => {
		return tags.every((tagFilter) => {
			const hasTag = trx.tags.some(
				(t) => t.category === tagFilter.category && tagFilter.values.includes(t.name)
			)

			if (tagFilter.mode === 'include') return hasTag
			if (tagFilter.mode === 'exclude') return !hasTag
			return true
		})
	}
	by.type = 'byDateRange'
	return by
}
