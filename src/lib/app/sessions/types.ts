import type { FilterMode, TagFilter } from '$lib/apis/pipelines/types.js'
import type { TransactionType } from '$lib/apis/record/transactions/types.js'

// --- Session State ---

export type SessionLoadStatus = 'idle' | 'loading' | 'ready' | 'error'
export type SessionLoadedFrom = 'upload' | 'snapshot' | 'rebuild'
export type SourceBackend = 'opfs' | 'snapshot'

export interface SourceMetadata {
	readonly fileName: string
	readonly size: number
	readonly modifiedAt: number
	readonly uploadedAt: string
	readonly sourcePath?: string
}

export interface SessionState {
	readonly status: SessionLoadStatus
	readonly backend?: SourceBackend
	readonly source?: SourceMetadata
	readonly transactionCount: number
	readonly lastLoadedFrom?: SessionLoadedFrom
	readonly lastError?: string
}

// --- Bootstrap Progress ---

export type BootstrapPhase =
	| 'source_import'
	| 'snapshot_write'
	| 'snapshot_load'
	| 'complete'
	| 'error'

export interface BootstrapProgress {
	readonly phase: BootstrapPhase
	readonly processed: number
	readonly total: number
	readonly error?: string
}

// --- Upload Progress ---

export type UploadPhase =
	| 'source_import'
	| 'lookups'
	| 'relations'
	| 'transactions'
	| 'snapshot_write'
	| 'complete'
	| 'error'

export interface UploadProgress {
	readonly phase: UploadPhase
	readonly processed: number
	readonly total?: number
	readonly percentage?: number
	readonly error?: string
}

// --- Filter State ---

export interface DateRange {
	readonly start: Date
	readonly end: Date
}

export interface FilterState {
	readonly dateRange?: DateRange
	readonly transactionTypes: readonly TransactionType[]
	readonly transactionTypeMode: FilterMode
	readonly categories: readonly string[]
	readonly categoryMode: FilterMode
	readonly payees: readonly string[]
	readonly accounts: readonly number[]
	readonly tags: readonly TagFilter[]
}

// --- Filter Options ---

export interface FilterOptions {
	readonly categories: readonly string[]
	readonly payees: readonly string[]
	readonly accounts: readonly { id: number; name: string }[]
	readonly transactionTypes: readonly TransactionType[]
	readonly tags: readonly string[]
	readonly dateRange?: DateRange
}

// --- Analytics ---

export interface Analytics {
	readonly income: number
	readonly expense: number
	readonly net: number
	readonly savingsRate: number
	readonly transactionCount: number
}
