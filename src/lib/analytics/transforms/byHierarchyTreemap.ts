import type { TransformBy, TreemapNode } from './models'

export const byHierarchyTreemap: TransformBy<TreemapNode[]> = (trx) => {
	const map = new Map<string, number>()

	for (const t of trx) {
		if (t.type !== 'Expense' && t.type !== 'Giveaway' && t.type !== 'Debt') {
			continue
		}
		if (!('category' in t)) continue

		const parent = t.category.category.trim() || 'Uncategorized'
		const child = t.category.subcategory.trim() || '(uncategorized)'
		const key = `${parent}::${child}`
		map.set(key, (map.get(key) ?? 0) + Math.abs(t.amount.value))
	}

	return Array.from(map.entries())
		.map(([key, value]) => {
			const [parent, child] = key.split('::')
			return {
				name: child,
				path: [parent, child],
				value,
			}
		})
		.sort((a, b) => b.value - a.value)
}

byHierarchyTreemap.type = 'byHierarchyTreemap'
