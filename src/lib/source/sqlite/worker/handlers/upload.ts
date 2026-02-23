import type { SessionProgress } from '$lib/session/models'
import type { UploadWorkerResult } from '$lib/source/sqlite/models'
import {
	clearSourceByBackend,
	openSnapshotSource,
	openUploadedSource,
} from '$lib/source/sqlite/worker/backends'
import {
	rebuildSnapshotFromDatabase,
	writeSessionSnapshotManifest,
} from '$lib/source/sqlite/worker/writers'

const isCantOpenError = (error: unknown): boolean => {
	if (!(error instanceof Error)) return false
	const message = error.message.toUpperCase()
	return (
		message.includes('SQLITE_CANTOPEN') || message.includes('RESULT CODE 14')
	)
}

export const handleUpload = async (
	file: File,
	onProgress?: (progress: SessionProgress) => void
): Promise<UploadWorkerResult> => {
	onProgress?.({ phase: 'source_import', processed: 0, percentage: 0 })

	const processSource = async (
		sourceResult: Awaited<ReturnType<typeof openUploadedSource>>
	): Promise<UploadWorkerResult> => {
		try {
			const summary = await rebuildSnapshotFromDatabase(
				sourceResult.db,
				onProgress
			)
			await writeSessionSnapshotManifest({
				backend: sourceResult.backend,
				sourceAvailable: sourceResult.sourceAvailable,
				source: sourceResult.source,
				transactionCount: summary.transactionCount,
			})

			return {
				backend: sourceResult.backend,
				sourceAvailable: sourceResult.sourceAvailable,
				source: sourceResult.source,
				transactionCount: summary.transactionCount,
			}
		} finally {
			sourceResult.db.close()
		}
	}

	const sourceResult = await openUploadedSource(file)
	try {
		return await processSource(sourceResult)
	} catch (error) {
		if (sourceResult.backend === 'opfs' && isCantOpenError(error)) {
			await clearSourceByBackend('opfs')
			const fallbackSource = await openSnapshotSource(file)
			return processSource(fallbackSource)
		}
		throw error
	}
}
