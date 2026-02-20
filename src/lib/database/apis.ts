import type { DatabaseState } from './state'
import type { Store } from '$utils/stores/models'
import { database } from '$lib/loggers'
import { newAPIs } from '$utils/apis/apis'

export const initDatabaseAPIs = <V extends number>(
	version: V,
	store: Store<DatabaseState>
) => {
	const log = database.extends('apis')

	const parse = async (file: File) => {
		const nextState: DatabaseState = {
			fileName: file.name,
			size: file.size,
			modifiedAt: file.lastModified,
		}

		log.debug('updating database metadata state', { file, nextState })
		await store.setAsync(nextState)
	}

	const reset = async () => {
		log.debug('resetting database metadata state')
		await store.resetAsync()
	}

	return newAPIs('database', version, {
		parse,
		reset,
	})
}
