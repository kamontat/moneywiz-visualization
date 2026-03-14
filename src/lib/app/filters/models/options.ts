import type { ParsedCategory, TagCategoryGroup } from '$lib/transactions/models'

export interface FilterOptions {
	categories: ParsedCategory[]
	tags: TagCategoryGroup[]
	payees?: string[]
	accounts?: string[]
	fileName?: string
	modifiedAt?: number
}
