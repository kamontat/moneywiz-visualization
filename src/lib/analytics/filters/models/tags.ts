export type FilterTagMode = 'include' | 'exclude'

export interface FilterTags {
	category: string
	values: string[]
	mode: FilterTagMode
}
