import type { Queriable, Versionable } from '$lib/types'

export type OnProgress<S> = (state: S) => void

export interface SqliteSourceMetadata {
	fileName: string
	size: number
	modifiedAt: number
	uploadedAt: string
}

// --- Bootstrap ---

export type BootstrapPhase =
	| 'source_import'
	| 'snapshot_write'
	| 'snapshot_load'
	| 'complete'

export interface BootstrapProgress {
	phase: BootstrapPhase
	processed: number
	error: number
	total: number
}

export type BootstrapMode = 'missed' | 'rebuilt' | 'reused'
export type BootstrapStatus = 'missed' | 'passed' | 'failed'

export interface BootstrapResult {
	mode: BootstrapMode
	status: BootstrapStatus
	message: string
	duration: number
	transactionCount: number
	sourceAvailable: boolean
	source?: SqliteSourceMetadata
}

// --- Upload ---

export type UploadPhase = 'import' | 'complete'

export interface UploadProgress {
	phase: UploadPhase
	processed: number
	error: number
	total: number
}

export type UploadStatus = 'passed' | 'failed'

export interface UploadResult {
	status: UploadStatus
	message: string
	duration: number
	transactionCount: number
	sourceAvailable: boolean
	source: SqliteSourceMetadata
}

export interface StatusResult {
	hasSource: boolean
	hasSnapshot: boolean
	transactionCount: number
	source?: SqliteSourceMetadata
}

// --- API Interface ---

export interface SqliteApiV1 extends Versionable<'sqlite', 1>, Queriable {
	bootstrap(
		onProgress?: OnProgress<BootstrapProgress>
	): Promise<BootstrapResult>
	upload(
		file: File,
		onProgress?: OnProgress<UploadProgress>
	): Promise<UploadResult>
	clear(): Promise<boolean>
	status(): Promise<StatusResult>
	terminate(): void
}
