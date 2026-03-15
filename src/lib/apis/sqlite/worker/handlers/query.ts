import type { QueryRequest, WorkerResponse } from '../../client/types'
import { workerState } from '../state'

export async function handleQuery(
	request: QueryRequest,
	respond: (r: WorkerResponse) => void
): Promise<void> {
	const { db } = workerState
	if (!db) {
		respond({
			type: 'error',
			id: request.id,
			message: 'No database loaded',
		})
		return
	}

	try {
		const rows = await db.query(request.sql, request.params)
		respond({
			type: 'query',
			id: request.id,
			rows,
		})
	} catch (err) {
		respond({
			type: 'error',
			id: request.id,
			message: err instanceof Error ? err.message : String(err),
		})
	}
}
