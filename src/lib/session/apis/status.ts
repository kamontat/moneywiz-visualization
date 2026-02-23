import type { SessionStore } from '$lib/session/models'
import { getSQLiteSourceStatus } from '$lib/source/sqlite'

export const refreshSessionStatus = async (
	store: SessionStore
): Promise<void> => {
	const status = await getSQLiteSourceStatus()
	store.patchSession({
		status: status.snapshotValid ? 'ready' : 'idle',
		backend: status.backend,
		source: status.source,
		transactionCount: status.transactionCount,
		lastLoadedFrom: status.snapshotValid ? 'snapshot' : undefined,
		lastError: status.snapshotValid ? undefined : 'snapshot_unavailable',
	})
}
