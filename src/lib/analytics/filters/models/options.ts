import type { ParsedCategory, TagCategoryGroup } from '$lib/transactions/models'

export interface FilterOptions {
	categories: ParsedCategory[]
	tags: TagCategoryGroup[]
	fileName?: string
	modifiedAt?: number
}
