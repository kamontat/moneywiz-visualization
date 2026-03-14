import type { Writable } from 'svelte/store'
import type {
	BootstrapProgress,
	OnProgress,
	SqliteApiV1,
	SqliteSourceMetadata,
	UploadProgress,
} from '$lib/apis/sqlite/index.js'
import type { SessionStore } from '$lib/app/sessions/store.js'
import type { SourceBackend, SourceMetadata } from '$lib/app/sessions/types.js'
import { createWorkerClient } from '$lib/apis/sqlite/index.js'

export type SessionProgressCallback = OnProgress<
	BootstrapProgress | UploadProgress
>

export interface SessionController {
	readonly name: 'session'
	bootstrap(onProgress?: SessionProgressCallback): Promise<void>
	upload(file: File, onProgress?: SessionProgressCallback): Promise<number>
	clear(): Promise<void>
	status(): Promise<void>
	readonly uploading: Writable<boolean>
}

let sharedClient: SqliteApiV1 | undefined

function getClient(): SqliteApiV1 {
	if (!sharedClient) {
		sharedClient = createWorkerClient()
	}
	return sharedClient
}

function toSourceMetadata(
	source: SqliteSourceMetadata | undefined
): SourceMetadata | undefined {
	if (!source) return undefined
	return {
		fileName: source.fileName,
		size: source.size,
		modifiedAt: source.modifiedAt,
		uploadedAt: source.uploadedAt,
	}
}

function toBackend(
	hasSource: boolean,
	hasSnapshot: boolean
): SourceBackend | undefined {
	if (hasSource) return 'opfs'
	if (hasSnapshot) return 'snapshot'
	return undefined
}

export function createSessionController(
	store: SessionStore,
	uploading: Writable<boolean>
): SessionController {
	const bootstrap = async (
		onProgress?: SessionProgressCallback
	): Promise<void> => {
		store.patch({ status: 'loading', lastError: undefined })

		try {
			const result = await getClient().bootstrap(onProgress)

			if (result.status === 'missed') {
				store.patch({
					status: 'idle',
					backend: toBackend(result.sourceAvailable, false),
					source: toSourceMetadata(result.source),
					transactionCount: result.transactionCount,
					lastError: undefined,
				})
				return
			}

			if (result.status === 'failed') {
				store.patch({
					status: 'error',
					lastError: result.message,
				})
				return
			}

			store.patch({
				status: 'ready',
				backend: toBackend(result.sourceAvailable, result.mode === 'reused'),
				source: toSourceMetadata(result.source),
				transactionCount: result.transactionCount,
				lastLoadedFrom: result.mode === 'rebuilt' ? 'rebuild' : 'snapshot',
				lastError: undefined,
			})
		} catch (err) {
			store.patch({
				status: 'error',
				lastError: err instanceof Error ? err.message : 'Bootstrap failed',
			})
		}
	}

	const upload = async (
		file: File,
		onProgress?: SessionProgressCallback
	): Promise<number> => {
		uploading.set(true)
		store.patch({ status: 'loading', lastError: undefined })

		try {
			const result = await getClient().upload(file, onProgress)

			if (result.status !== 'passed') {
				store.patch({
					status: 'error',
					lastError: result.message,
				})
				return 0
			}

			store.patch({
				status: 'ready',
				backend: result.sourceAvailable ? 'opfs' : 'snapshot',
				source: toSourceMetadata(result.source),
				transactionCount: result.transactionCount,
				lastLoadedFrom: 'upload',
				lastError: undefined,
			})

			return result.transactionCount
		} catch (err) {
			store.patch({
				status: 'error',
				lastError: err instanceof Error ? err.message : 'Upload failed',
			})
			return 0
		} finally {
			uploading.set(false)
		}
	}

	const clear = async (): Promise<void> => {
		uploading.set(true)
		store.patch({ status: 'loading', lastError: undefined })

		try {
			await getClient().clear()
			store.reset()
		} catch (err) {
			store.patch({
				status: 'error',
				lastError: err instanceof Error ? err.message : 'Clear failed',
			})
		} finally {
			uploading.set(false)
		}
	}

	const status = async (): Promise<void> => {
		try {
			const result = await getClient().status()

			store.patch({
				status: result.hasSnapshot ? 'ready' : 'idle',
				backend: toBackend(result.hasSource, result.hasSnapshot),
				source: toSourceMetadata(result.source),
				transactionCount: result.transactionCount,
				lastLoadedFrom: result.hasSnapshot ? 'snapshot' : undefined,
				lastError: result.hasSnapshot ? undefined : 'snapshot_unavailable',
			})
		} catch (err) {
			store.patch({
				status: 'error',
				lastError: err instanceof Error ? err.message : 'Status check failed',
			})
		}
	}

	return {
		name: 'session',
		bootstrap,
		upload,
		clear,
		status,
		uploading,
	}
}
