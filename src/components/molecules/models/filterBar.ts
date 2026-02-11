import type { FilterState as BaseFilterState } from '$lib/analytics/filters/models/state'

export type FilterState = BaseFilterState

export type TagCategory = {
	category: string
	tags: string[]
}
