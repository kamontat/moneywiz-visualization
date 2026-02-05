import type { ParsedCsv } from './models'
import type { CsvState } from './state'
import type { State } from '$utils/states/models'
import type { Store } from '$utils/stores/models'
import { parseCsvFile } from './parser'

import { csv } from '$lib/loggers'
import { newAPIs } from '$utils/apis/apis'
import {
	indexDBV1,
	STATE_CSV_RAW_HEAD_V1,
	STATE_CSV_RAW_ROWS_V1,
} from '$utils/stores'

export const initCsvAPIs = <V extends number>(
	version: V,
	state: State<CsvState>,
	store: Store<CsvState>
) => {
	const db = indexDBV1
	const log = csv.extends('apis')

	const parse = async (file: File) => {
		// Set up state on store
		const state = {
			fileName: file.name,
			size: file.size,
			modifiedAt: file.lastModified,
		}

		log.debug('parsing csv file', { file, state })
		const parsed = await parseCsvFile(file)
		log.debug('parsed csv file', { parsed })

		log.debug('storing parsed csv headers into indexdb')
		const headTrx = await db.transaction(STATE_CSV_RAW_HEAD_V1, 'readwrite')
		await Promise.all([
			parsed.headers.map((head, i) => headTrx.store.put(head, i)),
			headTrx.done,
		])

		log.debug('storing parsed csv rows into indexdb')
		const rowTrx = await db.transaction(STATE_CSV_RAW_ROWS_V1, 'readwrite')
		await Promise.all([
			...parsed.rows.map((row, i) => rowTrx.store.put(row, i)),
			rowTrx.done,
		])

		// Update store state last because we want to ensure data is written first
		log.debug('updating csv state in store')
		await store.setAsync(state)
	}

	const read = async (limit?: number): Promise<ParsedCsv> => {
		const headTrx = await db.transaction(STATE_CSV_RAW_HEAD_V1)
		const headers = await headTrx.store.getAll(undefined, limit)
		const rowTrx = await db.transaction(STATE_CSV_RAW_ROWS_V1)
		const rows = await rowTrx.store.getAll(undefined, limit)
		return { headers, rows }
	}

	const reset = async () => {
		await db.delete(STATE_CSV_RAW_HEAD_V1)
		await db.delete(STATE_CSV_RAW_ROWS_V1)
		await store.resetAsync()
	}

	return newAPIs('csv', version, {
		parse,
		read,
		reset,
	})
}
