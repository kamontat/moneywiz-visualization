import type { SqliteRuntime } from './runtime/database.js'
import { openDB } from 'idb'

import { IndexdbProvider } from '$lib/providers/indexdb/index.js'
import {
	SnapshotReader,
	SnapshotWriter,
} from '$lib/providers/indexdb/snapshot.js'
import { OpfsProvider } from '$lib/providers/opfs/index.js'

const DB_NAME = 'moneywiz-v3'
const DB_VERSION = 1
const STORES = ['manifest', 'meta', 'transactions'] as const
const SOURCE_FILENAME = 'source.sqlite'

function createIndexdb(): IndexdbProvider {
	const engine = openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			for (const store of STORES) {
				if (!db.objectStoreNames.contains(store)) {
					db.createObjectStore(store)
				}
			}
		},
	})
	return new IndexdbProvider(engine)
}

function createOpfs(): OpfsProvider {
	return new OpfsProvider(navigator.storage.getDirectory())
}

/** Mutable worker-scoped state */
export const workerState = {
	db: null as SqliteRuntime | null,
	indexdb: createIndexdb(),
	opfs: createOpfs(),
	sourceFilename: SOURCE_FILENAME,
}

export function getSnapshotWriter(): SnapshotWriter {
	const { indexdb } = workerState
	return new SnapshotWriter(
		indexdb.table('manifest'),
		indexdb.table('meta'),
		indexdb.table('transactions')
	)
}

export function getSnapshotReader(): SnapshotReader {
	const { indexdb } = workerState
	return new SnapshotReader(
		indexdb.table('manifest'),
		indexdb.table('meta'),
		indexdb.table('transactions')
	)
}
