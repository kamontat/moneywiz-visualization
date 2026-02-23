import type { OnSessionProgress } from './progress'
import type {
	BootstrapWorkerResult,
	ClearWorkerResult,
	StatusWorkerResult,
	UploadWorkerResult,
} from '$lib/source/sqlite/models'
import {
	handleWorkerMessage,
	nextRequestId,
	type PendingRequest,
	sendWorkerRequest,
} from './request'

export interface SQLiteWorkerClient {
	upload: (
		file: File,
		onProgress?: OnSessionProgress
	) => Promise<UploadWorkerResult>
	bootstrap: (onProgress?: OnSessionProgress) => Promise<BootstrapWorkerResult>
	rebuildSnapshot: (
		onProgress?: OnSessionProgress
	) => Promise<BootstrapWorkerResult>
	clear: () => Promise<ClearWorkerResult>
	status: () => Promise<StatusWorkerResult>
	terminate: () => void
}

export const createWorkerClient = (): SQLiteWorkerClient => {
	const worker = new Worker(new URL('../worker/entry.ts', import.meta.url), {
		type: 'module',
	})
	const pending = new Map<string, PendingRequest>()

	worker.onmessage = (event) => {
		handleWorkerMessage(pending, event.data)
	}

	const requestWithPayload = <T>(
		action: 'upload',
		payload: { file: File },
		onProgress?: OnSessionProgress
	): Promise<T> => {
		const id = nextRequestId()
		const message = { id, action, payload } as const
		return sendWorkerRequest<T>(worker, pending, message, onProgress)
	}

	const requestWithoutPayload = <T>(
		action: 'bootstrap' | 'rebuild_snapshot' | 'clear' | 'status',
		onProgress?: OnSessionProgress
	): Promise<T> => {
		const id = nextRequestId()
		const message = { id, action } as const
		return sendWorkerRequest<T>(worker, pending, message, onProgress)
	}

	return {
		upload: async (file, onProgress) => {
			return requestWithPayload('upload', { file }, onProgress)
		},
		bootstrap: async (onProgress) => {
			return requestWithoutPayload('bootstrap', onProgress)
		},
		rebuildSnapshot: async (onProgress) => {
			return requestWithoutPayload('rebuild_snapshot', onProgress)
		},
		clear: async () => {
			return requestWithoutPayload('clear')
		},
		status: async () => {
			return requestWithoutPayload('status')
		},
		terminate: () => {
			worker.terminate()
			pending.clear()
		},
	}
}
