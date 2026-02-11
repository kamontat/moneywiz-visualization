import type {
	SQLiteSession,
	SQLiteSessionOptions,
	SQLiteWorkerRequest,
	SQLiteWorkerResponse,
} from './models'

const toError = (value: unknown): Error =>
	value instanceof Error ? value : new Error(String(value))

const newRequestId = (() => {
	let counter = 0
	return () => {
		counter += 1
		return `sqlite-${counter}`
	}
})()

export const createSQLiteSession = async (
	file: File,
	options: SQLiteSessionOptions = {}
): Promise<SQLiteSession> => {
	const worker = new Worker(new URL('./worker.ts', import.meta.url), {
		type: 'module',
	})

	type Pending = {
		resolve: (value: unknown) => void
		reject: (reason?: unknown) => void
	}

	const pending = new Map<string, Pending>()
	let closed = false

	const closePending = (reason: unknown) => {
		for (const request of pending.values()) {
			request.reject(reason)
		}
		pending.clear()
	}

	worker.addEventListener(
		'message',
		(event: MessageEvent<SQLiteWorkerResponse>) => {
			const payload = event.data
			if (!payload) return

			const active = pending.get(payload.id)
			if (!active) return

			if (payload.status === 'progress') {
				options.onProgress?.(payload.progress)
				return
			}

			pending.delete(payload.id)
			if (payload.status === 'error') {
				active.reject(new Error(payload.error))
				return
			}
			active.resolve(payload.data)
		}
	)

	worker.addEventListener('error', (event) => {
		closePending(new Error(event.message))
	})

	const request = <T>(
		message: SQLiteWorkerRequest,
		transferables: Transferable[] = []
	): Promise<T> => {
		if (closed) {
			return Promise.reject(new Error('SQLite session has been closed'))
		}

		return new Promise<T>((resolve, reject) => {
			pending.set(message.id, {
				resolve: (value) => resolve(value as T),
				reject,
			})
			worker.postMessage(message, transferables)
		})
	}

	try {
		const buffer = await file.arrayBuffer()
		const openId = newRequestId()
		const overview = await request<SQLiteSession['overview']>(
			{
				id: openId,
				action: 'open',
				payload: {
					fileName: file.name,
					fileSizeBytes: file.size,
					buffer,
				},
			},
			[buffer]
		)

		const session: SQLiteSession = {
			overview,
			getPage: async (page) => {
				const pageId = newRequestId()
				return request({
					id: pageId,
					action: 'getPage',
					payload: page,
				})
			},
			close: async () => {
				if (closed) return

				try {
					const closeId = newRequestId()
					await request<{ closed: true }>({
						id: closeId,
						action: 'close',
					})
				} catch (error) {
					throw toError(error)
				} finally {
					closed = true
					closePending(new Error('SQLite session has been closed'))
					worker.terminate()
				}
			},
		}

		return session
	} catch (error) {
		closed = true
		closePending(error)
		worker.terminate()
		throw toError(error)
	}
}
