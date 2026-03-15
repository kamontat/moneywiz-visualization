import type { FilterFn, FilterMode } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

/**
 * Filter transactions by category name.
 * Matches against the top-level category field.
 */
export function byCategory(
	categories: ReadonlyArray<string>,
	mode: FilterMode = 'include'
): FilterFn<DataTransaction> {
	const allowed = new Set(categories)
	return (input) =>
		input.filter((tx) => {
			const fullName = tx.subcategory
				? `${tx.category} > ${tx.subcategory}`
				: tx.category
			const matches = Array.from(allowed).some(
				(category) =>
					fullName === category || fullName.startsWith(`${category} >`)
			)
			return mode === 'include' ? matches : !matches
		})
}
