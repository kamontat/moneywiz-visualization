import type { TransformBy, TransformByFunc } from './models'
import type { ParsedTransactionType } from '$lib/transactions'
import { byCategoryTotal, type CategoryTotal } from './byCategoryTotal'

export interface TopCategoryTotal extends CategoryTotal {
	type: ParsedTransactionType
}

export const byTopCategoryTotal: TransformByFunc<
	[number],
	TopCategoryTotal[]
> = (size) => {
	const by: TransformBy<TopCategoryTotal[]> = (trx) => {
		const totals = byCategoryTotal(trx)
		const entries = Object.entries(totals).map(([type, data]) => ({
			type,
			...data,
		}))
		entries.sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
		const top = entries.slice(0, size)

		return top.map((item) => ({
			type: item.type as ParsedTransactionType,
			total: item.total,
			parents: item.parents,
		}))
	}

	by.type = 'byTopCategoryTotal'
	return by
}
