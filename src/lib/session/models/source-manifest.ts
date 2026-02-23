export type SourceBackend = 'opfs' | 'snapshot'

export interface SourceManifest {
	fileName: string
	size: number
	modifiedAt: number
	uploadedAt: string
	sourcePath?: string
}

export interface SessionManifest {
	key: 'current'
	backend: SourceBackend
	sourceAvailable: boolean
	snapshotVersion: number
	transactionCount: number
	updatedAt: string
	source?: SourceManifest
}
