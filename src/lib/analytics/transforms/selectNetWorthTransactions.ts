import type { FilterState } from '$lib/analytics/filters/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { byAccount, byDateRange, filter } from '$lib/analytics/filters'

export const selectNetWorthTransactions = (
	transactions: ParsedTransaction[],
	filterState: FilterState
): ParsedTransaction[] => {
	const filters = []

	if (filterState.dateRange.start && filterState.dateRange.end) {
		filters.push(
			byDateRange(filterState.dateRange.start, filterState.dateRange.end)
		)
	} else if (filterState.dateRange.start) {
		filters.push(byDateRange(filterState.dateRange.start, new Date()))
	} else if (filterState.dateRange.end) {
		filters.push(byDateRange(new Date(0), filterState.dateRange.end))
	}

	if (filterState.accounts.length > 0) {
		filters.push(byAccount({ accounts: filterState.accounts }))
	}

	return filters.length > 0 ? filter(transactions, ...filters) : transactions
}
