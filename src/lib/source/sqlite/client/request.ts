import type { OnSessionProgress } from './progress'
import type {
	SQLiteWorkerRequest,
	SQLiteWorkerResponse,
} from '$lib/source/sqlite/models'

export interface PendingRequest {
	resolve: (value: unknown) => void
	reject: (error: Error) => void
	onProgress?: OnSessionProgress
}

let requestSequence = 0

export const nextRequestId = (): string => {
	requestSequence += 1
	return `sqlite-worker-${requestSequence}`
}

export const handleWorkerMessage = (
	pending: Map<string, PendingRequest>,
	message: SQLiteWorkerResponse
): void => {
	const record = pending.get(message.id)
	if (!record) return

	if (message.status === 'progress') {
		record.onProgress?.(message.progress)
		return
	}

	pending.delete(message.id)
	if (message.status === 'error') {
		record.reject(new Error(message.error))
		return
	}

	record.resolve(message.data)
}

export const sendWorkerRequest = <T>(
	worker: Worker,
	pending: Map<string, PendingRequest>,
	request: SQLiteWorkerRequest,
	onProgress?: OnSessionProgress
): Promise<T> => {
	return new Promise<T>((resolve, reject) => {
		pending.set(request.id, {
			resolve: resolve as (value: unknown) => void,
			reject,
			onProgress,
		})
		worker.postMessage(request)
	})
}
