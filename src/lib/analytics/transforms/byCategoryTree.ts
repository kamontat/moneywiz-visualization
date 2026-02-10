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

		const parentMap: Record<
			string,
			{ total: number; children: Record<string, number> }
		> = {}
		let grandTotal = 0

		for (const t of trx) {
			if (!('category' in t) || t.type !== transactionType) continue

			const amount = Math.abs(t.amount.value)
			const { parent, child } = normalizeCategory(
				t.category.category,
				t.category.subcategory
			)
			const normalizedChild = child || '(uncategorized)'

			if (!parentMap[parent]) {
				parentMap[parent] = { total: 0, children: {} }
			}
			if (!parentMap[parent].children[normalizedChild]) {
				parentMap[parent].children[normalizedChild] = 0
			}

			parentMap[parent].children[normalizedChild] += amount
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
