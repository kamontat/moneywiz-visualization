import type {
	SQLiteOverview,
	SQLitePageRequest,
	SQLiteParseProgress,
	SQLiteSectionPage,
	SQLiteSession,
	SQLiteSessionOptions,
	SQLiteWorkerRequest,
	SQLiteWorkerResponse,
} from './models'

type Resolver = {
	resolve: (value: unknown) => void
	reject: (error: Error) => void
	onProgress?: (progress: SQLiteParseProgress) => void
}

let idSeq = 0

const createWorker = () => {
	const worker = new Worker(new URL('./worker.ts', import.meta.url), {
		type: 'module',
	})
	const pending = new Map<string, Resolver>()

	worker.onmessage = (e: MessageEvent<SQLiteWorkerResponse>) => {
		const msg = e.data
		if (!msg || !msg.id) return
		const r = pending.get(msg.id)
		if (!r) return
		if (msg.status === 'progress') {
			if (msg.action === 'open') r.onProgress?.(msg.progress)
			return
		}
		pending.delete(msg.id)
		if (msg.status === 'error') r.reject(new Error(msg.error))
		else r.resolve(msg.data)
	}

	const request = <T>(
		msg: SQLiteWorkerRequest,
		transfer?: Transferable[],
		onProg?: (progress: SQLiteParseProgress) => void
	): Promise<T> =>
		new Promise<T>((resolve, reject) => {
			pending.set(msg.id, {
				resolve: resolve as (v: unknown) => void,
				reject,
				onProgress: onProg,
			})
			if (transfer?.length) {
				worker.postMessage(msg, transfer)
			} else {
				worker.postMessage(msg)
			}
		})

	return { worker, request }
}

export const createSQLiteSession = async (
	file: File,
	options: SQLiteSessionOptions = {}
): Promise<SQLiteSession> => {
	const { worker, request } = createWorker()
	const buffer = await file.arrayBuffer()
	const id = `r${++idSeq}`

	const overview = await request<SQLiteOverview>(
		{
			id,
			action: 'open',
			payload: {
				fileName: file.name,
				fileSizeBytes: file.size,
				buffer,
			},
		},
		[buffer],
		options.onProgress
	)

	return {
		overview,
		getPage: (req: SQLitePageRequest) =>
			request<SQLiteSectionPage>({
				id: `r${++idSeq}`,
				action: 'getPage',
				payload: req,
			}),
		close: async () => {
			await request({ id: `r${++idSeq}`, action: 'close' })
			worker.terminate()
		},
	}
}
