import type { SessionState, SessionStore } from '$lib/session/models'
import { writable } from 'svelte/store'

import {
	compareSessionState,
	createSessionState,
	normalizeSessionState,
} from '$lib/session/state'

export const createSessionStore = (): SessionStore => {
	const initial = createSessionState()
	const { subscribe, set, update } = writable(initial)

	const setSession = (state: SessionState) => {
		set(normalizeSessionState(state))
	}

	const patchSession = (partial: Partial<SessionState>) => {
		update((current) => {
			const next = normalizeSessionState({
				...current,
				...partial,
			})
			if (compareSessionState(current, next)) return current
			return next
		})
	}

	const resetSession = () => {
		set(initial)
	}

	return {
		subscribe,
		setSession,
		patchSession,
		resetSession,
	}
}
