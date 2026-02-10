import type { ParsedTransactionType } from '$lib/transactions/models'

export const formatTransactionType = (type: ParsedTransactionType): string => {
	return type.replace(/([a-z])([A-Z])/g, '$1 $2')
}
