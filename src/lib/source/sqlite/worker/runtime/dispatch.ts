import type {
	SQLiteWorkerRequest,
	SQLiteWorkerResponse,
} from '$lib/source/sqlite/models'
import {
	handleBootstrap,
	handleClear,
	handleRebuildSnapshot,
	handleStatus,
	handleUpload,
} from '$lib/source/sqlite/worker/handlers'

export const dispatchWorkerAction = async (
	request: SQLiteWorkerRequest,
	onProgress: (progress: SQLiteWorkerResponse) => void
): Promise<SQLiteWorkerResponse> => {
	switch (request.action) {
		case 'upload': {
			const data = await handleUpload(request.payload.file, (progress) => {
				onProgress({
					id: request.id,
					action: request.action,
					status: 'progress',
					progress,
				})
			})
			return {
				id: request.id,
				action: request.action,
				status: 'ok',
				data,
			}
		}
		case 'bootstrap': {
			const data = await handleBootstrap((progress) => {
				onProgress({
					id: request.id,
					action: request.action,
					status: 'progress',
					progress,
				})
			})
			return {
				id: request.id,
				action: request.action,
				status: 'ok',
				data,
			}
		}
		case 'rebuild_snapshot': {
			const data = await handleRebuildSnapshot((progress) => {
				onProgress({
					id: request.id,
					action: request.action,
					status: 'progress',
					progress,
				})
			})
			return {
				id: request.id,
				action: request.action,
				status: 'ok',
				data,
			}
		}
		case 'clear': {
			const data = await handleClear()
			return {
				id: request.id,
				action: request.action,
				status: 'ok',
				data,
			}
		}
		case 'status': {
			const data = await handleStatus()
			return {
				id: request.id,
				action: request.action,
				status: 'ok',
				data,
			}
		}
	}
}
