import type { CategoryTotal, TransformBy } from './models'
import type { ParsedTransactionType } from '$lib/transactions/models'

export const byCategoryTotal: TransformBy<
	Record<ParsedTransactionType, CategoryTotal>
> = (trx) => {
	const normalizeCategory = (
		category: string,
		subcategory: string
	): { parent: string; child: string } => {
		const parent = category.trim()
		const child = subcategory.trim()

		if (parent) return { parent, child }
		if (child) return { parent: child, child: '' }

		return { parent: 'Uncategorized', child: '' }
	}

	const totals = {} as Record<ParsedTransactionType, CategoryTotal>

	for (const t of trx) {
		if ('category' in t) {
			const type = t.type
			const cat = normalizeCategory(t.category.category, t.category.subcategory)

			if (!totals[type]) {
				totals[type] = { total: 0, parents: {} }
			}
			if (!totals[type].parents[cat.parent]) {
				totals[type].parents[cat.parent] = { total: 0, children: {} }
			}
			if (!totals[type].parents[cat.parent].children[cat.child]) {
				totals[type].parents[cat.parent].children[cat.child] = 0
			}

			totals[type].parents[cat.parent].children[cat.child] += t.amount.value
			totals[type].parents[cat.parent].total += t.amount.value
			totals[type].total += t.amount.value
		}
	}
	return totals
}
byCategoryTotal.type = 'bytotalsCategory'
