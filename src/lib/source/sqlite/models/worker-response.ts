import type {
	SessionProgress,
	SourceManifest,
	SourceBackend,
} from '$lib/session/models'

export interface UploadWorkerResult {
	backend: SourceBackend
	sourceAvailable: boolean
	source: SourceManifest
	transactionCount: number
}

export interface BootstrapWorkerResult {
	ready: boolean
	rebuilt: boolean
	backend?: SourceBackend
	sourceAvailable: boolean
	transactionCount: number
	reason?: string
	source?: SourceManifest
}

export interface StatusWorkerResult {
	backend?: SourceBackend
	sourceAvailable: boolean
	snapshotValid: boolean
	transactionCount: number
	source?: SourceManifest
}

export interface ClearWorkerResult {
	cleared: true
}

export type SQLiteWorkerResponse =
	| {
			id: string
			action: 'upload' | 'bootstrap' | 'rebuild_snapshot'
			status: 'progress'
			progress: SessionProgress
	  }
	| {
			id: string
			action: 'upload'
			status: 'ok'
			data: UploadWorkerResult
	  }
	| {
			id: string
			action: 'bootstrap' | 'rebuild_snapshot'
			status: 'ok'
			data: BootstrapWorkerResult
	  }
	| {
			id: string
			action: 'clear'
			status: 'ok'
			data: ClearWorkerResult
	  }
	| {
			id: string
			action: 'status'
			status: 'ok'
			data: StatusWorkerResult
	  }
	| {
			id: string
			action: 'upload' | 'bootstrap' | 'rebuild_snapshot' | 'clear' | 'status'
			status: 'error'
			error: string
	  }
