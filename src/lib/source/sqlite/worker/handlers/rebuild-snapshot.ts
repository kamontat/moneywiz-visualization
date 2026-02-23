import type { SessionProgress } from '$lib/session/models'
import type { BootstrapWorkerResult } from '$lib/source/sqlite/models'
import { openExistingOpfsSource } from '$lib/source/sqlite/worker/backends'
import {
	rebuildSnapshotFromDatabase,
	writeSessionSnapshotManifest,
} from '$lib/source/sqlite/worker/writers'
import { getSessionManifest } from '$lib/transactions/repository'

export const handleRebuildSnapshot = async (
	onProgress?: (progress: SessionProgress) => void
): Promise<BootstrapWorkerResult> => {
	const manifest = await getSessionManifest()
	if (!manifest || manifest.backend !== 'opfs' || !manifest.source) {
		return {
			ready: false,
			rebuilt: false,
			backend: manifest?.backend,
			sourceAvailable: false,
			transactionCount: 0,
			reason: 'opfs_manifest_missing',
		}
	}

	const database = await openExistingOpfsSource()
	if (!database) {
		return {
			ready: false,
			rebuilt: false,
			backend: 'opfs',
			sourceAvailable: false,
			source: manifest.source,
			transactionCount: 0,
			reason: 'opfs_source_missing',
		}
	}

	try {
		const summary = await rebuildSnapshotFromDatabase(database, onProgress)
		await writeSessionSnapshotManifest({
			backend: 'opfs',
			sourceAvailable: true,
			source: manifest.source,
			transactionCount: summary.transactionCount,
		})

		return {
			ready: true,
			rebuilt: true,
			backend: 'opfs',
			sourceAvailable: true,
			source: manifest.source,
			transactionCount: summary.transactionCount,
		}
	} finally {
		database.close()
	}
}
