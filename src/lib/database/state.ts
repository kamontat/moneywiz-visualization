import type { GetSchemaValue } from '$utils/db/models'
import type { StateEqualFn, StateNormalizeFn } from '$utils/states/models'
import type { STATE_DB_V1 } from '$utils/stores'
import type { StoreSchema } from '$utils/stores/models'
import { database } from '$lib/loggers'
import { newEmptyState, newState } from '$utils/states'

export type DatabaseState = GetSchemaValue<
	StoreSchema['v1:app-db'],
	typeof STATE_DB_V1,
	'default'
>

const log = database.extends('state')

const normalize: StateNormalizeFn<DatabaseState> = (state) => {
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
	return state as DatabaseState
}

const equal: StateEqualFn<DatabaseState> = (a, b) =>
	a?.fileName === b?.fileName &&
	a?.size === b?.size &&
	a?.modifiedAt === b?.modifiedAt

export const initDatabaseState = () => {
	const empty = newEmptyState<DatabaseState>(undefined)
	return newState(empty, {
		normalize,
		equal,
	})
}
