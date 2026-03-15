import type { WorkerRequest, WorkerResponse } from '../client/types'
import { handleBootstrap } from './handlers/bootstrap'
import { handleClear } from './handlers/clear'
import { handleQuery } from './handlers/query'
import { handleStatus } from './handlers/status'
import { handleUpload } from './handlers/upload'

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
