import type { SessionProgress, SessionStore } from '$lib/session/models'
import { bootstrapSQLiteSource } from '$lib/source/sqlite'

export const bootstrapSession = async (
	store: SessionStore,
	onProgress?: (progress: SessionProgress) => void
): Promise<void> => {
	store.patchSession({
		status: 'loading',
		lastError: undefined,
	})

	const result = await bootstrapSQLiteSource(onProgress)
	if (!result.ready) {
		store.patchSession({
			status: 'idle',
			backend: result.backend,
			source: result.source,
			transactionCount: result.transactionCount,
			lastError: result.reason,
		})
		return
	}

	store.patchSession({
		status: 'ready',
		backend: result.backend,
		source: result.source,
		transactionCount: result.transactionCount,
		lastLoadedFrom: result.rebuilt ? 'rebuild' : 'snapshot',
		lastError: undefined,
	})
}
