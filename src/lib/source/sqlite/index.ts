import type { OnSessionProgress } from './client'
import type {
	BootstrapWorkerResult,
	ClearWorkerResult,
	StatusWorkerResult,
	UploadWorkerResult,
} from './models'
import type {
	BootstrapProgress,
	BootstrapResult,
	SqliteSourceMetadata,
	StatusResult,
	UploadProgress,
	UploadResult,
} from '$lib/apis/sqlite/types/index.js'
import type { SourceBackend, SourceManifest } from '$lib/session/models'
import { createWorkerClient } from '$lib/apis/sqlite/client/index.js'

let sharedClient: ReturnType<typeof createWorkerClient> | undefined

const PROGRESS_PHASE_MAP = {
	source_import: 'source_import',
	snapshot_write: 'snapshot_write',
	snapshot_load: 'source_import',
	import: 'transactions',
	complete: 'complete',
} as const

const getWorkerClient = () => {
	if (!sharedClient) {
		sharedClient = createWorkerClient()
	}
	return sharedClient
}

const toSourceManifest = (
	source: SqliteSourceMetadata | undefined
): SourceManifest | undefined => {
	if (!source) return undefined

	return {
		fileName: source.fileName,
		size: source.size,
		modifiedAt: source.modifiedAt,
		uploadedAt: source.uploadedAt,
	}
}

const toBackend = (
	hasSource: boolean,
	hasSnapshot: boolean
): SourceBackend | undefined => {
	if (hasSource) return 'opfs'
	if (hasSnapshot) return 'snapshot'
	return undefined
}

const toProgress = (
	progress: BootstrapProgress | UploadProgress
): Parameters<OnSessionProgress>[0] => {
	const total =
		progress.total && progress.total > 0 ? progress.total : undefined
	const percentage =
		total === undefined
			? progress.phase === 'complete'
				? 100
				: undefined
			: Math.min(100, Math.round((progress.processed / total) * 100))

	return {
		phase: PROGRESS_PHASE_MAP[progress.phase],
		processed: progress.processed,
		total,
		percentage,
	}
}

const toUploadWorkerResult = (result: UploadResult): UploadWorkerResult => ({
	backend: result.sourceAvailable ? 'opfs' : 'snapshot',
	sourceAvailable: result.sourceAvailable,
	source: toSourceManifest(result.source) ?? {
		fileName: 'source.sqlite',
		size: 0,
		modifiedAt: 0,
		uploadedAt: new Date(0).toISOString(),
	},
	transactionCount: result.transactionCount,
})

const toBootstrapWorkerResult = (
	result: BootstrapResult
): BootstrapWorkerResult => ({
	ready: result.status === 'passed',
	rebuilt: result.mode === 'rebuilt',
	backend: toBackend(result.sourceAvailable, result.mode === 'reused'),
	sourceAvailable: result.sourceAvailable,
	transactionCount: result.transactionCount,
	reason: result.status === 'missed' ? 'no_snapshot' : undefined,
	source: toSourceManifest(result.source),
})

const toStatusWorkerResult = (result: StatusResult): StatusWorkerResult => ({
	backend: toBackend(result.hasSource, result.hasSnapshot),
	sourceAvailable: result.hasSource,
	snapshotValid: result.hasSnapshot,
	transactionCount: result.transactionCount,
	source: toSourceManifest(result.source),
})

export const uploadSQLiteSource = async (
	file: File,
	onProgress?: OnSessionProgress
): Promise<UploadWorkerResult> => {
	const result = await getWorkerClient().upload(file, (progress) => {
		onProgress?.(toProgress(progress))
	})
	if (result.status !== 'passed') {
		throw new Error(result.message)
	}
	return toUploadWorkerResult(result)
}

export const bootstrapSQLiteSource = async (
	onProgress?: OnSessionProgress
): Promise<BootstrapWorkerResult> => {
	const result = await getWorkerClient().bootstrap((progress) => {
		onProgress?.(toProgress(progress))
	})
	if (result.status === 'failed') {
		throw new Error(result.message)
	}
	return toBootstrapWorkerResult(result)
}

export const rebuildSQLiteSnapshot = async (
	onProgress?: OnSessionProgress
): Promise<BootstrapWorkerResult> => {
	return bootstrapSQLiteSource(onProgress)
}

export const clearSQLiteSource = async (): Promise<ClearWorkerResult> => {
	const cleared = await getWorkerClient().clear()
	if (!cleared) {
		throw new Error('Clear failed')
	}
	return { cleared: true }
}

export const getSQLiteSourceStatus = async (): Promise<StatusWorkerResult> => {
	const result = await getWorkerClient().status()
	return toStatusWorkerResult(result)
}

export const terminateSQLiteSourceWorker = () => {
	sharedClient?.terminate()
	sharedClient = undefined
}
