import type { Queriable } from '$lib/types'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'

/**
 * Patch WAL mode bytes in the header to legacy journal mode.
 * Bytes 18-19 indicate WAL when both are 0x02.
 */
function patchWalMode(buffer: ArrayBuffer): ArrayBuffer {
	const view = new DataView(buffer)
	if (view.getUint8(18) === 2 && view.getUint8(19) === 2) {
		view.setUint8(18, 1)
		view.setUint8(19, 1)
	}
	return buffer
}

export interface SqliteRuntime extends Queriable {
	close(): void
}

export async function openDatabase(
	buffer: ArrayBuffer
): Promise<SqliteRuntime> {
	const patched = patchWalMode(buffer)
	const sqlite3 = await sqlite3InitModule()
	const p = sqlite3.wasm.allocFromTypedArray(new Uint8Array(patched))
	const db = new sqlite3.oo1.DB()
	const rc = sqlite3.capi.sqlite3_deserialize(
		db.pointer!,
		'main',
		p,
		patched.byteLength,
		patched.byteLength,
		sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE |
			sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE
	)
	if (rc !== 0) {
		throw new Error(`sqlite3_deserialize failed with code ${rc}`)
	}

	return {
		async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
			const rows: T[] = []
			db.exec({
				sql,
				bind: params as never,
				rowMode: 'object',
				callback: (row: unknown) => {
					rows.push(row as T)
				},
			})
			return rows
		},
		close() {
			db.close()
		},
	}
}
