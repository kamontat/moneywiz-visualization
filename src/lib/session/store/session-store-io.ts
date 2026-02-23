import type {
	SessionManifest,
	SessionState,
	SourceManifest,
} from '$lib/session/models'
import { normalizeSessionState } from '$lib/session/state'

export const toSessionStateFromManifest = (
	manifest: SessionManifest
): SessionState => {
	return normalizeSessionState({
		status: 'ready',
		backend: manifest.backend,
		source: manifest.source,
		transactionCount: manifest.transactionCount,
		lastLoadedFrom: 'snapshot',
	})
}

export const toSourceMetadata = (
	state: SessionState
): SourceManifest | undefined => {
	if (!state.source?.fileName) return undefined
	return state.source
}
