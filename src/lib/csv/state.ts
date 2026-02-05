import type { GetSchemaValue } from '$utils/db/models'
import type { StateEqualFn, StateNormalizeFn } from '$utils/states/models'
import type { STATE_CSV_V1 } from '$utils/stores'
import type { StoreSchema } from '$utils/stores/models'
import { csv } from '$lib/loggers'
import { newEmptyState, newState } from '$utils/states'

export type CsvState = GetSchemaValue<
	StoreSchema['v1:app-db'],
	typeof STATE_CSV_V1,
	'default'
>

const log = csv.extends('state')

const normalize: StateNormalizeFn<CsvState> = (state) => {
	if (!state) {
		log.debug('normalize empty state to undefined')
		return undefined
	}
	if (!state.fileName) {
		log.debug('normalize empty fileName to undefined')
		return undefined
	}
	if (!state.size) {
		log.debug('normalize empty size to undefined')
		return undefined
	}
	if (!state.modifiedAt) {
		log.debug('normalize empty modifiedAt to undefined')
		return undefined
	}
	return state as CsvState
}

const equal: StateEqualFn<CsvState> = (a, b) =>
	a?.fileName === b?.fileName &&
	a?.size === b?.size &&
	a?.modifiedAt === b?.modifiedAt

export const initCsvState = () => {
	const empty = newEmptyState<CsvState>(undefined)
	return newState(empty, {
		normalize,
		equal,
	})
}
