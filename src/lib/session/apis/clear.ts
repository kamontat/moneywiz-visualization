import type { SessionStore } from '$lib/session/models'
import { clearSQLiteSource } from '$lib/source/sqlite'

export const clearSessionData = async (store: SessionStore): Promise<void> => {
	store.patchSession({
		status: 'loading',
		lastError: undefined,
	})

	await clearSQLiteSource()
	store.resetSession()
}
