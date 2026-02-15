import type { FilterBy, FilterByFunc } from './models'
import { FILTER_TYPES } from './models'

import {
	isDebtCategory,
	isDebtRepaymentCategory,
	isGiftCategory,
	isSpecialCategory,
} from '$lib/transactions/utils'

export type SpecialCategoryFilterMode =
	| 'exclude-all'
	| 'only-debt'
	| 'only-gift'
	| 'only-special'

export const bySpecialCategory: FilterByFunc<[SpecialCategoryFilterMode]> = (
	mode
) => {
	const by: FilterBy = (trx) => {
		if (!('category' in trx)) {
			return mode === 'exclude-all'
		}

		const isDebt = isDebtCategory(trx.category)
		const isDebtRepayment = isDebtRepaymentCategory(trx.category)
		const isGift = isGiftCategory(trx.category)
		const isSpecial = isSpecialCategory(trx.category)

		switch (mode) {
			case 'exclude-all':
				return !isSpecial
			case 'only-debt':
				return isDebt || isDebtRepayment
			case 'only-gift':
				return isGift
			case 'only-special':
				return isSpecial
			default:
				return true
		}
	}
	by.type = FILTER_TYPES.SPECIAL_CATEGORY
	return by
}
