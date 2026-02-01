import type { TransformBy, TransformByFunc } from './models'

export type AggregatedTag = Record<string, string[]>

export const byAggregatedTag: TransformByFunc<[], AggregatedTag> = () => {
	const by: TransformBy<AggregatedTag> = (trx) => {
		const map = new Map<string, Set<string>>()

		for (const t of trx) {
			for (const tag of t.tags) {
				if (!map.has(tag.category)) {
					map.set(tag.category, new Set())
				}
				map.get(tag.category)?.add(tag.name)
			}
		}

		const result: AggregatedTag = {}
		for (const [category, tags] of map) {
			result[category] = Array.from(tags).sort()
		}

		return result
	}
	by.type = 'byAggregatedTag'
	return by
}
