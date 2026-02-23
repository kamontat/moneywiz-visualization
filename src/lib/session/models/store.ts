import type { Readable } from 'svelte/store'
import type { SessionState } from './session-state'

export interface SessionStore extends Readable<SessionState> {
	setSession: (state: SessionState) => void
	patchSession: (partial: Partial<SessionState>) => void
	resetSession: () => void
}
