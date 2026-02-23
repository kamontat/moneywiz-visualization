export type LedgerImportPhase =
	| 'source_import'
	| 'lookups'
	| 'relations'
	| 'transactions'
	| 'snapshot_write'
	| 'complete'
	| 'error'

export interface LedgerImportProgress {
	phase: LedgerImportPhase
	processed: number
	total?: number
	percentage?: number
	error?: string
}
