import type { FilterCategoryMode } from './category'
import type { FilterTagMode as TagMode } from './tags'
import type { ParsedTransactionType } from '$lib/transactions/models'

export interface FilterState {
	dateRange: {
		start: Date | undefined
		end: Date | undefined
	}
	transactionTypes: ParsedTransactionType[]
	categories: string[]
	categoryMode: FilterCategoryMode
	tags: TagFilter[]
	payees: string[]
}

export interface TagFilter {
	category: string
	values: string[]
	mode: TagMode
}

export const emptyFilterState = (): FilterState => ({
	dateRange: {
		start: undefined,
		end: undefined,
	},
	transactionTypes: [],
	categories: [],
	categoryMode: 'include',
	tags: [],
	payees: [],
})

export const hasActiveFilters = (state: FilterState): boolean => {
	return (
		state.dateRange.start !== undefined ||
		state.dateRange.end !== undefined ||
		state.transactionTypes.length > 0 ||
		state.categories.length > 0 ||
		state.tags.some((t) => t.values.length > 0) ||
		state.payees.length > 0
	)
}

export type { FilterTagMode } from './tags'
