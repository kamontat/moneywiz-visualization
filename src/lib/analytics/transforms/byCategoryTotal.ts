import type { CategoryTotal, TransformBy } from './models'
import type { ParsedTransactionType } from '$lib/transactions/models'

export const byCategoryTotal: TransformBy<
	Record<ParsedTransactionType, CategoryTotal>
> = (trx) => {
	const totals = {} as Record<ParsedTransactionType, CategoryTotal>

	for (const t of trx) {
		if ('category' in t) {
			const type = t.type
			const cat = t.category

			if (!totals[type]) {
				totals[type] = { total: 0, parents: {} }
			}
			if (!totals[type].parents[cat.category]) {
				totals[type].parents[cat.category] = { total: 0, children: {} }
			}
			if (!totals[type].parents[cat.category].children[cat.subcategory]) {
				totals[type].parents[cat.category].children[cat.subcategory] = 0
			}

			totals[type].parents[cat.category].children[cat.subcategory] +=
				t.amount.value
			totals[type].parents[cat.category].total += t.amount.value
			totals[type].total += t.amount.value
		}
	}
	return totals
}
byCategoryTotal.type = 'bytotalsCategory'
