import type { FilterTagMode } from './tags'
import type { ParsedTransactionType } from '$lib/transactions/models'

export interface FilterState {
	dateRange: {
		start: Date | undefined
		end: Date | undefined
	}
	transactionTypes: ParsedTransactionType[]
	tags: TagFilter[]
}

export interface TagFilter {
	category: string
	values: string[]
	mode: FilterTagMode
}

export const emptyFilterState = (): FilterState => ({
	dateRange: {
		start: undefined,
		end: undefined,
	},
	transactionTypes: [],
	tags: [],
})

export const hasActiveFilters = (state: FilterState): boolean => {
	return (
		state.dateRange.start !== undefined ||
		state.dateRange.end !== undefined ||
		state.transactionTypes.length > 0 ||
		state.tags.some((t) => t.values.length > 0)
	)
}
