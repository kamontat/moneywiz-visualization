import type { Database } from '@sqlite.org/sqlite-wasm'
import type { SourceBackend, SourceManifest } from '$lib/session/models'
import {
	clearOpfsSource,
	importFileToOpfs,
	openOpfsDatabase,
	opfsSourceExists,
	supportsOpfsBackend,
	OPFS_SOURCE_PATH,
} from './opfs-backend'
import { openSnapshotDatabase } from './snapshot-backend'

import { getSqlite3 } from '$lib/source/sqlite/worker/runtime'

export interface OpenSourceResult {
	backend: SourceBackend
	sourceAvailable: boolean
	source: SourceManifest
	db: Database
}

const toSourceManifestBase = (file: File): SourceManifest => {
	return {
		fileName: file.name,
		size: file.size,
		modifiedAt: file.lastModified,
		uploadedAt: new Date().toISOString(),
	}
}

export const openSnapshotSource = async (
	file: File
): Promise<OpenSourceResult> => {
	const sqlite3 = await getSqlite3()
	return {
		backend: 'snapshot',
		sourceAvailable: false,
		source: toSourceManifestBase(file),
		db: await openSnapshotDatabase(sqlite3, file),
	}
}

export const openUploadedSource = async (
	file: File
): Promise<OpenSourceResult> => {
	const sqlite3 = await getSqlite3()
	const sourceBase = toSourceManifestBase(file)

	if (supportsOpfsBackend(sqlite3)) {
		try {
			await importFileToOpfs(sqlite3, file)
			return {
				backend: 'opfs',
				sourceAvailable: true,
				source: {
					...sourceBase,
					sourcePath: OPFS_SOURCE_PATH,
				},
				db: openOpfsDatabase(sqlite3),
			}
		} catch {
			// OPFS path failed; fallback to snapshot backend below.
		}
	}

	return openSnapshotSource(file)
}

export const openExistingOpfsSource = async (): Promise<
	Database | undefined
> => {
	const sqlite3 = await getSqlite3()
	if (!supportsOpfsBackend(sqlite3)) return undefined
	if (!(await opfsSourceExists())) return undefined
	try {
		return openOpfsDatabase(sqlite3)
	} catch {
		// Source exists in metadata but cannot be opened in this runtime.
		return undefined
	}
}

export const clearSourceByBackend = async (
	backend: SourceBackend | undefined
) => {
	if (backend === 'opfs') {
		await clearOpfsSource()
	}
}

export const isSourceAvailable = async (
	backend: SourceBackend | undefined
): Promise<boolean> => {
	if (backend !== 'opfs') return false
	return opfsSourceExists()
}
