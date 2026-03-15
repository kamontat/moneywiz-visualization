import type { FilterFn, TagFilter } from '../types'
import type { DataTransaction } from '$lib/apis/record/transactions/types'

/**
 * Filter transactions that have at least one tag matching the given list.
 * Each tag is specified as "category:name".
 */
export function byTags(
	tags: ReadonlyArray<string> | ReadonlyArray<TagFilter>
): FilterFn<DataTransaction> {
	if (tags.every((tag) => typeof tag === 'string')) {
		const allowed = new Set(tags)
		return (input) =>
			input.filter((tx) =>
				tx.tags.some((tag) => allowed.has(`${tag.category}:${tag.name}`))
			)
	}

	return (input) =>
		input.filter((tx) =>
			tags.every((tagFilter) => {
				const hasTag = tx.tags.some(
					(tag) =>
						tag.category === tagFilter.category &&
						tagFilter.values.includes(tag.name)
				)
				return tagFilter.mode === 'include' ? hasTag : !hasTag
			})
		)
}
