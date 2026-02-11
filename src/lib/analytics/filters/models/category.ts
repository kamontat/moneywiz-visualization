export type FilterCategoryMode = 'include' | 'exclude'

export interface FilterCategory {
	categories: string[]
	mode: FilterCategoryMode
}
