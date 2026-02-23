import type { Database, Sqlite3Static } from '@sqlite.org/sqlite-wasm'
import { readFileInChunks } from '$lib/source/sqlite/worker/utils'

const OPFS_DIR_NAME = 'moneywiz'
const OPFS_FILE_NAME = 'current.sqlite3'
export const OPFS_SOURCE_PATH = `/${OPFS_DIR_NAME}/${OPFS_FILE_NAME}`
const OPFS_SOURCE_PATH_ALT = `${OPFS_DIR_NAME}/${OPFS_FILE_NAME}`
const OPFS_SOURCE_PATH_CANDIDATES = [
	OPFS_SOURCE_PATH,
	OPFS_SOURCE_PATH_ALT,
] as const
const OPFS_IMPORT_CHUNK_SIZE = 4 * 1024 * 1024

const ensureOpfsDirectory = async (): Promise<FileSystemDirectoryHandle> => {
	const root = await navigator.storage.getDirectory()
	return root.getDirectoryHandle(OPFS_DIR_NAME, { create: true })
}

const getOpfsDirectory = async (): Promise<FileSystemDirectoryHandle> => {
	const root = await navigator.storage.getDirectory()
	return root.getDirectoryHandle(OPFS_DIR_NAME, { create: false })
}

export const supportsOpfsBackend = (sqlite3: Sqlite3Static): boolean => {
	if (!('opfs' in sqlite3)) return false
	return typeof sqlite3.oo1.OpfsDb?.importDb === 'function'
}

export const importFileToOpfs = async (
	sqlite3: Sqlite3Static,
	file: File
): Promise<void> => {
	await ensureOpfsDirectory()

	try {
		const directory = await ensureOpfsDirectory()
		const handle = await directory.getFileHandle(OPFS_FILE_NAME, {
			create: true,
		})
		const writable = await handle.createWritable()

		try {
			await readFileInChunks(file, OPFS_IMPORT_CHUNK_SIZE, async (chunk) => {
				const payload = new Uint8Array(chunk.byteLength)
				payload.set(chunk)
				await writable.write(payload)
			})
			await writable.close()
		} catch (error) {
			await writable.abort()
			throw error
		}

		const db = openOpfsDatabase(sqlite3)
		db.close()
		return
	} catch {
		const buffer = await file.arrayBuffer()
		let lastError: unknown
		for (const path of OPFS_SOURCE_PATH_CANDIDATES) {
			try {
				await sqlite3.oo1.OpfsDb.importDb(path, buffer)
				return
			} catch (error) {
				lastError = error
			}
		}
		throw lastError
	}
}

export const openOpfsDatabase = (sqlite3: Sqlite3Static): Database => {
	let lastError: unknown
	for (const path of OPFS_SOURCE_PATH_CANDIDATES) {
		try {
			// Open existing file only; do not create an empty DB on path mismatch.
			return new sqlite3.oo1.OpfsDb(path, 'w')
		} catch (error) {
			lastError = error
		}
	}
	throw lastError
}

export const opfsSourceExists = async (): Promise<boolean> => {
	try {
		const directory = await getOpfsDirectory()
		await directory.getFileHandle(OPFS_FILE_NAME, { create: false })
		return true
	} catch {
		return false
	}
}

export const clearOpfsSource = async (): Promise<void> => {
	try {
		const directory = await getOpfsDirectory()
		await directory.removeEntry(OPFS_FILE_NAME)
	} catch {
		// OPFS source may not exist.
	}
}
