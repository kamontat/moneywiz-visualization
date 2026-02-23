/// <reference lib="webworker" />

import type {
	SQLiteWorkerRequest,
	SQLiteWorkerResponse,
} from '$lib/source/sqlite/models'
import { executeWorkerRequest } from './runtime'
import { postWorkerResponse } from './runtime/lifecycle'

const workerScope = self as DedicatedWorkerGlobalScope

workerScope.onmessage = async (event: MessageEvent<SQLiteWorkerRequest>) => {
	const request = event.data
	if (!request) return

	try {
		const response = await executeWorkerRequest(request, postWorkerResponse)
		postWorkerResponse(response)
	} catch (error) {
		const failure: SQLiteWorkerResponse = {
			id: request.id,
			action: request.action,
			status: 'error',
			error: error instanceof Error ? error.message : String(error),
		}
		postWorkerResponse(failure)
	}
}
