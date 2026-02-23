import type {
	SessionManifest,
	SourceBackend,
	SourceManifest,
} from '$lib/session/models'
import { setSessionManifest } from '$lib/ledger/repository'
import { SNAPSHOT_SCHEMA_VERSION } from '$lib/session/persistence'

export const writeSessionSnapshotManifest = async (input: {
	backend: SourceBackend
	sourceAvailable: boolean
	source?: SourceManifest
	transactionCount: number
}) => {
	const manifest: SessionManifest = {
		key: 'current',
		backend: input.backend,
		sourceAvailable: input.sourceAvailable,
		source: input.source,
		snapshotVersion: SNAPSHOT_SCHEMA_VERSION,
		transactionCount: input.transactionCount,
		updatedAt: new Date().toISOString(),
	}

	await setSessionManifest(manifest)
	return manifest
}
