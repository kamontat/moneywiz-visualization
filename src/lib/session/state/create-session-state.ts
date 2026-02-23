import type { SessionState } from '$lib/session/models'

export const createSessionState = (): SessionState => {
	return {
		status: 'idle',
		transactionCount: 0,
	}
}
