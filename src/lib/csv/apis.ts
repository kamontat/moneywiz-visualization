import type { CsvState } from './state'
import type { Store } from '$utils/stores/models'
import { csv } from '$lib/loggers'
import { newAPIs } from '$utils/apis/apis'

export const initCsvAPIs = <V extends number>(
	version: V,
	store: Store<CsvState>
) => {
	const log = csv.extends('apis')

	const parse = async (file: File) => {
		// Set up state on store
		const nextState: CsvState = {
			fileName: file.name,
			size: file.size,
			modifiedAt: file.lastModified,
		}

		log.debug('updating csv metadata state', { file, nextState })
		await store.setAsync(nextState)
	}

	const reset = async () => {
		log.debug('resetting csv metadata state')
		await store.resetAsync()
	}

	return newAPIs('csv', version, {
		parse,
		reset,
	})
}
