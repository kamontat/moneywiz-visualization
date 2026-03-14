import type { FilterBy, FilterByFunc, FilterTags } from './models'
import type { ParsedTag } from '$lib/transactions/models'
import { FILTER_TYPES } from './models'

export const byTags: FilterByFunc<FilterTags[]> = (...tags) => {
	const by: FilterBy = (trx) => {
		return tags.every((tagFilter) => {
			const hasTag = trx.tags.some(
				(t: ParsedTag) =>
					t.category === tagFilter.category && tagFilter.values.includes(t.name)
			)

			if (tagFilter.mode === 'include') return hasTag
			if (tagFilter.mode === 'exclude') return !hasTag
			return true
		})
	}
	by.type = FILTER_TYPES.TAGS
	return by
}
