export interface ImportProgress {
	phase: 'parsing' | 'importing' | 'complete' | 'error'
	processed: number
	total: number
	percentage: number
	error?: Error
}

export interface ImportOptions {
	batchSize?: number
	onProgress?: (progress: ImportProgress) => void
}
