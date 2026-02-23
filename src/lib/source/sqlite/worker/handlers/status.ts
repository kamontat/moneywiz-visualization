import type { StatusWorkerResult } from '$lib/source/sqlite/models'
import { isSourceAvailable } from '$lib/source/sqlite/worker/backends'
import { getSnapshotStatus } from '$lib/transactions/repository'

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
