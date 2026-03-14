import type { FilterBy, FilterByFunc, FilterAccount } from './models'
import { FILTER_TYPES } from './models'

export const byAccount: FilterByFunc<[FilterAccount]> = (filter) => {
	const by: FilterBy = (trx) => {
		if (!('account' in trx)) return false
		return filter.accounts.some((a: string) => a === trx.account.name)
	}
	by.type = FILTER_TYPES.ACCOUNT
	return by
}
