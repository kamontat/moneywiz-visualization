import type { FilterState as BaseFilterState } from '$lib/app/filters'

export type FilterState = BaseFilterState

export type TagCategory = {
	category: string
	tags: string[]
}
