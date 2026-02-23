import type { SourceBackend, SourceManifest } from './source-manifest'

export type SessionLoadStatus = 'idle' | 'loading' | 'ready' | 'error'
export type SessionLoadedFrom = 'upload' | 'snapshot' | 'rebuild'

export interface SessionState {
	status: SessionLoadStatus
	backend?: SourceBackend
	source?: SourceManifest
	transactionCount: number
	lastLoadedFrom?: SessionLoadedFrom
	lastError?: string
}
