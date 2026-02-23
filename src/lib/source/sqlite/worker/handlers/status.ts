import type { StatusWorkerResult } from '$lib/source/sqlite/models'
import { getSnapshotStatus } from '$lib/ledger/repository'
import { isSourceAvailable } from '$lib/source/sqlite/worker/backends'

export const handleStatus = async (): Promise<StatusWorkerResult> => {
	const snapshot = await getSnapshotStatus()
	const sourceAvailable = await isSourceAvailable(snapshot.manifest?.backend)

	return {
		backend: snapshot.manifest?.backend,
		sourceAvailable,
		snapshotValid: snapshot.valid,
		transactionCount: snapshot.transactionCount,
		source: snapshot.manifest?.source,
	}
}
