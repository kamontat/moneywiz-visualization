import type { SessionProgress } from '$lib/session/models'
import type { BootstrapWorkerResult } from '$lib/source/sqlite/models'
import {
	openExistingOpfsSource,
	isSourceAvailable,
} from '$lib/source/sqlite/worker/backends'
import {
	rebuildSnapshotFromDatabase,
	writeSessionSnapshotManifest,
} from '$lib/source/sqlite/worker/writers'
import { getSnapshotStatus } from '$lib/transactions/repository'

export const handleBootstrap = async (
	onProgress?: (progress: SessionProgress) => void
): Promise<BootstrapWorkerResult> => {
	const status = await getSnapshotStatus()
	if (status.valid) {
		return {
			ready: true,
			rebuilt: false,
			backend: status.manifest?.backend,
			sourceAvailable: status.manifest?.sourceAvailable ?? false,
			transactionCount: status.transactionCount,
			source: status.manifest?.source,
		}
	}

	const manifest = status.manifest
	const sourceAvailable = await isSourceAvailable(manifest?.backend)
	if (!manifest || manifest.backend !== 'opfs' || !sourceAvailable) {
		return {
			ready: false,
			rebuilt: false,
			backend: manifest?.backend,
			sourceAvailable,
			transactionCount: status.transactionCount,
			source: manifest?.source,
			reason: 'snapshot_unavailable',
		}
	}

	const database = await openExistingOpfsSource()
	if (!database) {
		return {
			ready: false,
			rebuilt: false,
			backend: 'opfs',
			sourceAvailable: false,
			transactionCount: status.transactionCount,
			source: manifest.source,
			reason: 'source_unavailable',
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
			transactionCount: summary.transactionCount,
			source: manifest.source,
		}
	} finally {
		database.close()
	}
}
