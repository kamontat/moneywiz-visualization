import type { OnSessionProgress } from './client'
import type {
	BootstrapWorkerResult,
	ClearWorkerResult,
	StatusWorkerResult,
	UploadWorkerResult,
} from './models'
import { createWorkerClient } from './client'

let sharedClient: ReturnType<typeof createWorkerClient> | undefined

const getWorkerClient = () => {
	if (!sharedClient) {
		sharedClient = createWorkerClient()
	}
	return sharedClient
}

export const uploadSQLiteSource = async (
	file: File,
	onProgress?: OnSessionProgress
): Promise<UploadWorkerResult> => {
	return getWorkerClient().upload(file, onProgress)
}

export const bootstrapSQLiteSource = async (
	onProgress?: OnSessionProgress
): Promise<BootstrapWorkerResult> => {
	return getWorkerClient().bootstrap(onProgress)
}

export const rebuildSQLiteSnapshot = async (
	onProgress?: OnSessionProgress
): Promise<BootstrapWorkerResult> => {
	return getWorkerClient().rebuildSnapshot(onProgress)
}

export const clearSQLiteSource = async (): Promise<ClearWorkerResult> => {
	return getWorkerClient().clear()
}

export const getSQLiteSourceStatus = async (): Promise<StatusWorkerResult> => {
	return getWorkerClient().status()
}

export const terminateSQLiteSourceWorker = () => {
	sharedClient?.terminate()
	sharedClient = undefined
}
