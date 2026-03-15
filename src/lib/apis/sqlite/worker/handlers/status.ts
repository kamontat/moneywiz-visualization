import type { StatusRequest, WorkerResponse } from '../../client/types'
import { getSnapshotReader, workerState } from '../state'

export async function handleStatus(
	request: StatusRequest,
	respond: (r: WorkerResponse) => void
): Promise<void> {
	const { opfs, sourceFilename } = workerState
	const reader = getSnapshotReader()

	const [hasSource, hasSnapshot] = await Promise.all([
		opfs.has(sourceFilename),
		reader.hasSnapshot(),
	])
	const [manifest, source] = await Promise.all([
		reader.getManifest(),
		reader.getSourceMetadata(),
	])

	respond({
		type: 'status',
		id: request.id,
		result: {
			hasSource,
			hasSnapshot,
			transactionCount: manifest?.transactionCount ?? 0,
			source,
		},
	})
}
