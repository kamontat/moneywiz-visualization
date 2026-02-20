import type {
	BindingSpec,
	Database,
	Sqlite3Static,
} from '@sqlite.org/sqlite-wasm'
import type { SqlRow } from './helpers'

export type SqliteDatabase = Database
export type SqliteEngine = Sqlite3Static

let sqlite3Promise: Promise<Sqlite3Static> | undefined

export const getSqlite3 = (): Promise<Sqlite3Static> => {
	if (!sqlite3Promise) {
		// Suppress OPFS warning that occurs when SQLite tries to initialize OPFS VFS in main thread
		const originalWarn = console.warn
		console.warn = (...args) => {
			const message = args.join(' ')
			if (
				message.includes('OPFS sqlite3_vfs') &&
				message.includes('Atomics.wait')
			) {
				return // Suppress this specific warning
			}
			originalWarn.apply(console, args)
		}

		sqlite3Promise = import('@sqlite.org/sqlite-wasm')
			.then((m) => m.default())
			.finally(() => {
				// Restore original console.warn
				console.warn = originalWarn
			})
	}
	return sqlite3Promise
}

export const openDatabase = (
	sqlite3: Sqlite3Static,
	data: Uint8Array | ArrayBuffer
): Database => {
	const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)

	// SQLite header bytes 18-19 indicate the journal mode:
	//   1 = legacy (rollback journal), 2 = WAL
	// WAL databases fail with SQLITE_CANTOPEN after in-memory deserialize
	// because the VFS cannot open the required -wal/-shm sidecar files.
	// Patch to legacy mode so the deserialized DB is immediately queryable.
	if (bytes[18] === 2) {
		bytes[18] = 1
		bytes[19] = 1
	}

	const p = sqlite3.wasm.allocFromTypedArray(bytes)
	const db = new sqlite3.oo1.DB(':memory:')
	const rc = sqlite3.capi.sqlite3_deserialize(
		db.pointer!,
		'main',
		p,
		bytes.byteLength,
		bytes.byteLength,
		sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
	)
	db.checkRc(rc)
	return db
}

export const readRows = (
	db: Database,
	query: string,
	params: unknown[] = []
): SqlRow[] => {
	return db.exec(query, {
		bind: params.length > 0 ? (params as BindingSpec) : undefined,
		rowMode: 'object',
		returnValue: 'resultRows',
	}) as SqlRow[]
}

export const forEachRow = async (
	db: Database,
	query: string,
	onRow: (row: SqlRow) => void,
	options: {
		params?: unknown[]
		yieldEvery?: number
		onProgress?: (processed: number) => void
	} = {}
): Promise<number> => {
	const { params = [], yieldEvery = 500, onProgress } = options
	const stmt = db.prepare(query)
	if (params.length > 0) stmt.bind(params as BindingSpec)
	let processed = 0

	try {
		while (stmt.step()) {
			onRow(stmt.get({}) as SqlRow)
			processed += 1
			onProgress?.(processed)

			if (processed % yieldEvery === 0) {
				await new Promise((resolve) => setTimeout(resolve, 0))
			}
		}
	} finally {
		stmt.finalize()
	}

	return processed
}
