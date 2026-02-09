import type { FilterOptions } from './models'
import type { StateEqualFn, StateNormalizeFn } from '$utils/states/models'
import { analytic } from '$lib/loggers'
import { newEmptyState, newState } from '$utils/states'

const log = analytic.extends('filters.state')

const normalize: StateNormalizeFn<FilterOptions | undefined> = (state) => {
	if (!state) return undefined
	const categories = state.categories ?? []
	const tags = state.tags ?? []
	if (categories.length === 0 && tags.length === 0) {
		log.debug('normalize empty filter options to undefined')
		return undefined
	}
	return {
		categories,
		tags,
		fileName: state.fileName,
		modifiedAt: state.modifiedAt,
	}
}

const equal: StateEqualFn<FilterOptions | undefined> = (a, b) => {
	if (!a && !b) return true
	if (!a || !b) return false
	return (
		a.fileName === b.fileName &&
		a.modifiedAt === b.modifiedAt &&
		a.categories.length === b.categories.length &&
		a.tags.length === b.tags.length
	)
}

export const initFilterOptionsState = () => {
	const empty = newEmptyState<FilterOptions | undefined>(undefined)
	return newState(empty, {
		normalize,
		equal,
	})
}
