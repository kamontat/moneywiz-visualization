import type { FilterCategoryMode } from './category'
import type { FilterTagMode as TagMode } from './tags'
import type { TransactionTypeFilterMode as TypeMode } from '../byTransactionType'
import type { ParsedTransactionType } from '$lib/transactions/models'

export interface FilterState {
	dateRange: {
		start: Date | undefined
		end: Date | undefined
	}
	transactionTypes: ParsedTransactionType[]
	transactionTypeMode: TypeMode
	categories: string[]
	categoryMode: FilterCategoryMode
	tags: TagFilter[]
	payees: string[]
	accounts: string[]
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
	transactionTypeMode: 'include',
	categories: [],
	categoryMode: 'include',
	tags: [],
	payees: [],
	accounts: [],
})

export const hasActiveFilters = (state: FilterState): boolean => {
	return (
		state.dateRange.start !== undefined ||
		state.dateRange.end !== undefined ||
		state.transactionTypes.length > 0 ||
		state.categories.length > 0 ||
		state.tags.some((t) => t.values.length > 0) ||
		state.payees.length > 0 ||
		state.accounts.length > 0
	)
}

export type { FilterTagMode } from './tags'
export type { TransactionTypeFilterMode } from '../byTransactionType'
