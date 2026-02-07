import type { ParsedCategory } from '$lib/transactions/models'

export const formatCategory = (cat: ParsedCategory): string => {
	return `${cat.category}${cat.subcategory ? ` > ${cat.subcategory}` : ''}`
}
