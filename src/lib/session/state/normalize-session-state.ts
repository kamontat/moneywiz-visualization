import type { SessionState } from '$lib/session/models'
import { createSessionState } from './create-session-state'

export const normalizeSessionState = (
	state: SessionState | Partial<SessionState> | undefined
): SessionState => {
	const empty = createSessionState()
	if (!state) return empty

	return {
		status:
			state.status === 'idle' ||
			state.status === 'loading' ||
			state.status === 'ready' ||
			state.status === 'error'
				? state.status
				: empty.status,
		backend: state.backend,
		source: state.source,
		transactionCount:
			typeof state.transactionCount === 'number' &&
			Number.isFinite(state.transactionCount)
				? state.transactionCount
				: empty.transactionCount,
		lastLoadedFrom: state.lastLoadedFrom,
		lastError: state.lastError,
	}
}
