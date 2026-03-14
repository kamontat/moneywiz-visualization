import type {
	FilterCategoryMode,
	FilterState,
	TagFilter,
	TransactionTypeFilterMode,
} from './models'
import type { ParsedTransactionType } from '$lib/transactions/models'
import { analytic } from '$lib/loggers'

const FILTER_SELECTION_STORAGE_KEY = 'moneywiz:filters:selection:v1'
const log = analytic.extends('filterSelectionPersistence')

type PersistedFilterSelection = {
	payees: string[]
	accounts: string[]
	categories: string[]
	categoryMode: FilterCategoryMode
	transactionTypes: ParsedTransactionType[]
	transactionTypeMode: TransactionTypeFilterMode
	tags: TagFilter[]
}

export const loadPersistedFilterSelection = ():
	| Partial<Omit<FilterState, 'dateRange'>>
	| undefined => {
	if (typeof window === 'undefined') return undefined
	try {
		const raw = window.localStorage.getItem(FILTER_SELECTION_STORAGE_KEY)
		if (!raw) return undefined
		const parsed = JSON.parse(raw) as PersistedFilterSelection
		return {
			payees: parsed.payees || [],
			accounts: parsed.accounts || [],
			categories: parsed.categories || [],
			categoryMode: parsed.categoryMode || 'include',
			transactionTypes: parsed.transactionTypes || [],
			transactionTypeMode: parsed.transactionTypeMode || 'include',
			tags: parsed.tags || [],
		}
	} catch (error) {
		log.warn('failed to load persisted filter selection', { error })
		return undefined
	}
}

export const persistFilterSelection = (
	filterState: Omit<FilterState, 'dateRange'>
): void => {
	if (typeof window === 'undefined') return
	try {
		const hasActiveFilters =
			filterState.payees.length > 0 ||
			filterState.accounts.length > 0 ||
			filterState.categories.length > 0 ||
			filterState.transactionTypes.length > 0 ||
			filterState.tags.some((t) => t.values.length > 0)

		if (!hasActiveFilters) {
			window.localStorage.removeItem(FILTER_SELECTION_STORAGE_KEY)
			return
		}

		const value: PersistedFilterSelection = {
			payees: filterState.payees,
			accounts: filterState.accounts,
			categories: filterState.categories,
			categoryMode: filterState.categoryMode,
			transactionTypes: filterState.transactionTypes,
			transactionTypeMode: filterState.transactionTypeMode,
			tags: filterState.tags,
		}
		window.localStorage.setItem(
			FILTER_SELECTION_STORAGE_KEY,
			JSON.stringify(value)
		)
	} catch (error) {
		log.warn('failed to persist filter selection', { error })
	}
}
