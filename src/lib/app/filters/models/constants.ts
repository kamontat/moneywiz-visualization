export const FILTER_TYPES = {
	DATE_RANGE: 'byDateRange',
	TRANSACTION_TYPE: 'byTransactionType',
	CATEGORY: 'byCategory',
	TAGS: 'byTags',
	CURRENCY: 'byCurrency',
	TRANSFER: 'byTransfer',
	SPECIAL_CATEGORY: 'bySpecialCategory',
	PAYEE: 'byPayee',
	ACCOUNT: 'byAccount',
	AND: 'AND',
	OR: 'OR',
	NOT: 'NOT',
} as const

export type FilterType = (typeof FILTER_TYPES)[keyof typeof FILTER_TYPES]
