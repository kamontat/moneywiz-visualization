import type { WorkerRequest, WorkerResponse } from '../client/types.js'
import { handleBootstrap } from './handlers/bootstrap.js'
import { handleClear } from './handlers/clear.js'
import { handleQuery } from './handlers/query.js'
import { handleStatus } from './handlers/status.js'
import { handleUpload } from './handlers/upload.js'

function respond(response: WorkerResponse): void {
	self.postMessage(response)
}

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
	const request = event.data
	try {
		switch (request.type) {
			case 'bootstrap':
				await handleBootstrap(request, respond)
				break
			case 'upload':
				await handleUpload(request, respond)
				break
			case 'clear':
				await handleClear(request, respond)
				break
			case 'status':
				await handleStatus(request, respond)
				break
			case 'query':
				await handleQuery(request, respond)
				break
		}
	} catch (err) {
		respond({
			type: 'error',
			id: request.id,
			message: err instanceof Error ? err.message : String(err),
		})
	}
})
