import type { ClearRequest, WorkerResponse } from '../../client/types.js'
import { getSnapshotWriter, workerState } from '../state.js'

export async function handleClear(
	request: ClearRequest,
	respond: (r: WorkerResponse) => void
): Promise<void> {
	try {
		// 1. Close database if open
		workerState.db?.close()
		workerState.db = null

		// 2. Clear snapshot from IndexedDB
		const writer = getSnapshotWriter()
		await writer.clear()

		// 3. Delete source file from OPFS
		const { opfs, sourceFilename } = workerState
		await opfs.delete(sourceFilename)

		respond({
			type: 'clear',
			id: request.id,
			success: true,
		})
	} catch {
		respond({
			type: 'clear',
			id: request.id,
			success: false,
		})
	}
}
