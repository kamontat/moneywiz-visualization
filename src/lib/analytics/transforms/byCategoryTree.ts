import type {
	CategoryTree,
	CategoryTreeChild,
	CategoryTreeParent,
	TransformBy,
	TransformByFunc,
} from './models'
import type { ParsedTransactionType } from '$lib/transactions/models'

export const byCategoryTree: TransformByFunc<
	[ParsedTransactionType],
	CategoryTree
> = (transactionType) => {
	const by: TransformBy<CategoryTree> = (trx) => {
		const parentMap: Record<
			string,
			{ total: number; children: Record<string, number> }
		> = {}
		let grandTotal = 0

		for (const t of trx) {
			if (!('category' in t) || t.type !== transactionType) continue

			const amount = Math.abs(t.amount.value)
			const parent = t.category.category
			const child = t.category.subcategory || '(uncategorized)'

			if (!parentMap[parent]) {
				parentMap[parent] = { total: 0, children: {} }
			}
			if (!parentMap[parent].children[child]) {
				parentMap[parent].children[child] = 0
			}

			parentMap[parent].children[child] += amount
			parentMap[parent].total += amount
			grandTotal += amount
		}

		const parents: CategoryTreeParent[] = Object.entries(parentMap)
			.map(([name, data]) => {
				const children: CategoryTreeChild[] = Object.entries(data.children)
					.map(([childName, childTotal]) => ({
						name: childName,
						total: childTotal,
						percentage: data.total === 0 ? 0 : (childTotal / data.total) * 100,
					}))
					.sort((a, b) => b.total - a.total)

				return {
					name,
					total: data.total,
					percentage: grandTotal === 0 ? 0 : (data.total / grandTotal) * 100,
					children,
				}
			})
			.sort((a, b) => b.total - a.total)

		return {
			total: grandTotal,
			parents,
		}
	}
	by.type = 'byCategoryTree'
	return by
}
