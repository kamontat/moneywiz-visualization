import type { LedgerAccountBalanceRow } from '$lib/transactions/models'
import { KCNT_ACCOUNT_MARKER } from './constants'

/**
 * Check if an account balance row belongs to a KcNt account.
 * Uses account name to identify KcNt accounts.
 */
export const isKcNtBalanceRow = (row: LedgerAccountBalanceRow): boolean => {
	return row.name?.includes(KCNT_ACCOUNT_MARKER) ?? false
}

/**
 * Filter out KcNt account balances from the balance list.
 * Used to exclude KcNt accounts from net worth calculations.
 */
export const filterKcNtAccountBalances = (
	balances: LedgerAccountBalanceRow[]
): LedgerAccountBalanceRow[] => {
	return balances.filter((row) => !isKcNtBalanceRow(row))
}

/**
 * Get only KcNt account balances.
 * Useful for displaying KcNt-specific net worth when in KcNt mode.
 */
export const getKcNtAccountBalances = (
	balances: LedgerAccountBalanceRow[]
): LedgerAccountBalanceRow[] => {
	return balances.filter((row) => isKcNtBalanceRow(row))
}
