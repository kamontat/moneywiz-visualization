import type { SessionProgress, SessionStore } from '$lib/session/models'
import { uploadSQLiteSource } from '$lib/source/sqlite'

export const uploadSessionFile = async (
	store: SessionStore,
	file: File,
	onProgress?: (progress: SessionProgress) => void
): Promise<number> => {
	store.patchSession({
		status: 'loading',
		lastError: undefined,
	})

	const result = await uploadSQLiteSource(file, onProgress)
	store.patchSession({
		status: 'ready',
		backend: result.backend,
		source: result.source,
		transactionCount: result.transactionCount,
		lastLoadedFrom: 'upload',
		lastError: undefined,
	})

	return result.transactionCount
}
