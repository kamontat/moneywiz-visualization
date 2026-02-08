export const DEFAULT_CURRENCY = 'THB'

/**
 * Category prefixes that represent income transactions.
 * Any transaction with a category starting with these names is classified as income.
 */
export const INCOME_CATEGORY_PREFIXES = [
	'Compensation',
	'Other Incomes',
] as const
export type IncomeCategoryPrefix = (typeof INCOME_CATEGORY_PREFIXES)[number]

/**
 * Special categories that represent non-standard transaction types.
 * These use "Other Expenses" or "Other Incomes" as parent categories.
 * The "►" separator in CSV exports is normalized to ">" after parsing.
 */
export const SPECIAL_CATEGORIES = {
	DEBT: 'Other Expenses > Debt',
	DEBT_REPAYMENT: 'Other Incomes > Debt Repayment',
	GIVEAWAYS: 'Other Expenses > Giveaways',
	WINDFALL: 'Other Incomes > Windfall',
} as const

export type SpecialCategory =
	(typeof SPECIAL_CATEGORIES)[keyof typeof SPECIAL_CATEGORIES]

export const DEBT_CATEGORIES = [
	SPECIAL_CATEGORIES.DEBT,
	SPECIAL_CATEGORIES.DEBT_REPAYMENT,
] as const

export const GIFT_CATEGORIES = [
	SPECIAL_CATEGORIES.GIVEAWAYS,
	SPECIAL_CATEGORIES.WINDFALL,
] as const
