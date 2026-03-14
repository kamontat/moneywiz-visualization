import type { CategoryTotal } from './categoryTotal'
import type { ParsedTransactionType } from '$lib/transactions/models'

export interface TopCategoryTotal extends CategoryTotal {
	type: ParsedTransactionType
}
