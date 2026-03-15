import type { ParsedTransaction } from '$lib/transactions/models'
import { hasKcNtTag, isKcNtToKcNtTransfer } from './detection'

export interface KcNtFilterOptions {
	kcntModeEnabled: boolean
}

/**
 * Filter transactions based on KcNt mode state.
 *
 * Default mode (kcntModeEnabled = false):
 * - Include all transactions EXCEPT KcNt-to-KcNt transfers
 * - (KcNt-tagged transactions are visible but will be reclassified)
 *
 * KcNt mode (kcntModeEnabled = true):
 * - Include ONLY transactions with Group:KcNt tag
 * - Exclude KcNt-to-KcNt transfers (internal movements)
 */
export const filterByKcNtMode = (
	transactions: ParsedTransaction[],
	options: KcNtFilterOptions
): ParsedTransaction[] => {
	if (options.kcntModeEnabled) {
		// KcNt mode: only show KcNt-tagged transactions, excluding KcNt-to-KcNt transfers
		return transactions.filter((tx) => {
			if (!hasKcNtTag(tx.tags)) return false
			if (isKcNtToKcNtTransfer(tx)) return false
			return true
		})
	}

	// Default mode: show all except KcNt-to-KcNt transfers
	return transactions.filter((tx) => !isKcNtToKcNtTransfer(tx))
}

/**
 * Create a filter function for use in filter chains
 */
export const byKcNtMode = (options: KcNtFilterOptions) => {
	return (transactions: ParsedTransaction[]): ParsedTransaction[] => {
		return filterByKcNtMode(transactions, options)
	}
}
