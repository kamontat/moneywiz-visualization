import type { SourceBackend, SourceManifest } from '$lib/session/models'

export interface UploadedSourceResult {
	backend: SourceBackend
	sourceAvailable: boolean
	source: SourceManifest
}
