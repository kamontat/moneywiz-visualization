import type { SessionState } from '$lib/session/models'

export const compareSessionState = (
	a: SessionState,
	b: SessionState
): boolean => {
	return (
		a.status === b.status &&
		a.backend === b.backend &&
		a.transactionCount === b.transactionCount &&
		a.lastLoadedFrom === b.lastLoadedFrom &&
		a.lastError === b.lastError &&
		a.source?.fileName === b.source?.fileName &&
		a.source?.size === b.source?.size &&
		a.source?.modifiedAt === b.source?.modifiedAt
	)
}
