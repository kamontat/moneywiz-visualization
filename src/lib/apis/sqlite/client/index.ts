import type {
	BootstrapProgress,
	BootstrapResult,
	OnProgress,
	SqliteApiV1,
	StatusResult,
	UploadProgress,
	UploadResult,
} from '../types/index.js'
import type { WorkerRequest, WorkerResponse } from './types.js'

interface PendingRequest {
	resolve: (value: unknown) => void
	reject: (reason: Error) => void
	onProgress?: (state: unknown) => void
}

let requestCounter = 0

function nextId(): string {
	return `req_${++requestCounter}`
}

export function createWorkerClient(): SqliteApiV1 {
	const worker = new Worker(new URL('../worker/entry.ts', import.meta.url), {
		type: 'module',
	})

	const pending = new Map<string, PendingRequest>()

	worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
		const msg = event.data
		const req = pending.get(msg.id)
		if (!req) return

		switch (msg.type) {
			case 'progress':
				req.onProgress?.(msg.progress)
				return
			case 'bootstrap':
				pending.delete(msg.id)
				req.resolve(msg.result)
				return
			case 'upload':
				pending.delete(msg.id)
				req.resolve(msg.result)
				return
			case 'clear':
				pending.delete(msg.id)
				req.resolve(msg.success)
				return
			case 'status':
				pending.delete(msg.id)
				req.resolve(msg.result)
				return
			case 'query':
				pending.delete(msg.id)
				req.resolve(msg.rows)
				return
			case 'error':
				pending.delete(msg.id)
				req.reject(new Error(msg.message))
				return
		}
	})

	function send<T>(
		request: WorkerRequest,
		onProgress?: (state: unknown) => void
	): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			pending.set(request.id, {
				resolve: resolve as (v: unknown) => void,
				reject,
				onProgress,
			})
			worker.postMessage(request)
		})
	}

	return {
		name: 'sqlite',
		version: 1,

		bootstrap(
			onProgress?: OnProgress<BootstrapProgress>
		): Promise<BootstrapResult> {
			const id = nextId()
			return send<BootstrapResult>(
				{ type: 'bootstrap', id },
				onProgress as (state: unknown) => void
			)
		},

		upload(
			file: File,
			onProgress?: OnProgress<UploadProgress>
		): Promise<UploadResult> {
			const id = nextId()
			return send<UploadResult>(
				{ type: 'upload', id, file },
				onProgress as (state: unknown) => void
			)
		},

		query<T>(sql: string, params?: unknown[]): Promise<T[]> {
			const id = nextId()
			return send<T[]>({ type: 'query', id, sql, params })
		},

		clear(): Promise<boolean> {
			const id = nextId()
			return send<boolean>({ type: 'clear', id })
		},

		status(): Promise<StatusResult> {
			const id = nextId()
			return send<StatusResult>({ type: 'status', id })
		},

		terminate(): void {
			worker.terminate()
			pending.clear()
		},
	}
}
