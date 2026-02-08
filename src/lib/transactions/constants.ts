export const DEFAULT_CURRENCY = 'THB'

export const INCOME_CATEGORIES = ['Compensation', 'Income'] as const
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]

export const SPECIAL_CATEGORIES = {
	DEBT: 'Payment > Debt',
	DEBT_REPAYMENT: 'Payment > Debt Repayment',
	GIVEAWAYS: 'Payment > Giveaways',
	WINDFALL: 'Payment > Windfall',
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
