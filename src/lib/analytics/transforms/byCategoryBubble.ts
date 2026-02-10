import type { CategoryBubblePoint, TransformBy } from './models'

export const byCategoryBubble: TransformBy<CategoryBubblePoint[]> = (trx) => {
	const map = new Map<string, { total: number; count: number }>()

	for (const t of trx) {
		if (t.type !== 'Expense' && t.type !== 'Giveaway' && t.type !== 'Debt') {
			continue
		}
		if (!('category' in t)) continue

		const category = t.category.category.trim() || 'Uncategorized'
		if (!map.has(category)) {
			map.set(category, { total: 0, count: 0 })
		}

		const entry = map.get(category)
		if (!entry) continue
		entry.total += Math.abs(t.amount.value)
		entry.count += 1
	}

	return Array.from(map.entries())
		.map(([category, entry]) => ({
			category,
			total: entry.total,
			count: entry.count,
			avgTicket: entry.count === 0 ? 0 : entry.total / entry.count,
		}))
		.sort((a, b) => b.total - a.total)
		.slice(0, 30)
}

byCategoryBubble.type = 'byCategoryBubble'
